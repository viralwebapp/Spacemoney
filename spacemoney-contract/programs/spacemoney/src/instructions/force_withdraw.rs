use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::constants::*;
use crate::errors::SpaceMoneyError;
use crate::events::{ForceWithdrewEvent, TokenType};
use crate::states::*;
use crate::utils::*;

#[derive(Accounts)]
pub struct ForceWithdraw<'info> {
    #[account(
        mut,
        seeds = [PLATFORM_SEED],
        bump = platform_state.bump
    )]
    pub platform_state: Account<'info, PlatformState>,
    
    #[account(
        mut,
        seeds = [USER_SEED, user.key().as_ref()],
        bump = user_account.bump,
        constraint = user_account.user == user.key() @ SpaceMoneyError::Unauthorized
    )]
    pub user_account: Account<'info, UserAccount>,
    
    #[account(
        seeds = [TIERS_SEED],
        bump = tier_config.bump
    )]
    pub tier_config: Account<'info, TierConfig>,
    
    #[account(
        mut,
        constraint = user_token_account.owner == user.key() @ SpaceMoneyError::TokenAccountOwnerMismatch,
    )]
    pub user_token_account: Option<Account<'info, TokenAccount>>,
    
    #[account(mut)]
    pub platform_token_account: Option<Account<'info, TokenAccount>>,
    
    /// CHECK: PDA authority for token transfers
    #[account(
        seeds = [VAULT_SEED],
        bump
    )]
    pub vault_authority: AccountInfo<'info>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub token_program: Option<Program<'info, Token>>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<ForceWithdraw>, stake_index: u64) -> Result<()> {
    let platform_state = &mut ctx.accounts.platform_state;
    let user_account = &mut ctx.accounts.user_account;
    let clock = Clock::get()?;
    
    // Check if program is paused
    require!(!platform_state.is_paused, SpaceMoneyError::ProgramPaused);
    
    // Get stake
    let index = stake_index as usize;
    require!(
        index < user_account.stakes.len(),
        SpaceMoneyError::InvalidStakeIndex
    );
    
    let stake = &mut user_account.stakes[index];
    require!(stake.is_active, SpaceMoneyError::StakeNotFound);
    
    // Can only force withdraw if still locked
    require!(
        clock.unix_timestamp < stake.lock_until,
        SpaceMoneyError::StakeLocked // Use normal withdraw if unlocked
    );
    
    // Calculate accrued rewards
    let (_, multiplier, _) = match stake.tier {
        Tier::Boot => (BOOT_MIN_STAKE, BOOT_MULTIPLIER, BOOT_LOCK_DAYS),
        Tier::Symbiotic => (SYMBIOTIC_MIN_STAKE, SYMBIOTIC_MULTIPLIER, SYMBIOTIC_LOCK_DAYS),
        Tier::Space => (SPACE_MIN_STAKE, SPACE_MULTIPLIER, SPACE_LOCK_DAYS),
    };
    
    let accrued_rewards = calculate_accrued_rewards(
        stake.amount,
        multiplier,
        stake.deposited_at,
        clock.unix_timestamp,
    )?;
    
    let unclaimed_rewards = accrued_rewards
        .checked_sub(stake.claimed_rewards)
        .ok_or(SpaceMoneyError::CalculationError)?;
    
    // Apply 20% penalty
    let penalty = calculate_force_withdraw_penalty(unclaimed_rewards)?;
    let rewards_after_penalty = unclaimed_rewards
        .checked_sub(penalty)
        .ok_or(SpaceMoneyError::CalculationError)?;
    
    let total_withdrawal = stake.amount
        .checked_add(rewards_after_penalty)
        .ok_or(SpaceMoneyError::NumericalOverflow)?;
    
    // Handle withdrawal based on token type
    match stake.token_type {
        TokenType::SOL => {
            // Check balance
            let platform_balance = platform_state.to_account_info().lamports();
            require!(
                platform_balance >= total_withdrawal,
                SpaceMoneyError::InsufficientTreasuryBalance
            );
            
            // Transfer SOL
            **platform_state.to_account_info().try_borrow_mut_lamports()? -= total_withdrawal;
            **ctx.accounts.user.to_account_info().try_borrow_mut_lamports()? += total_withdrawal;
            
            // Add penalty to treasury
            platform_state.treasury_sol = platform_state.treasury_sol
                .checked_add(penalty)
                .ok_or(SpaceMoneyError::NumericalOverflow)?;
            
            // Update staked amount
            platform_state.total_staked_sol = platform_state.total_staked_sol
                .checked_sub(stake.amount)
                .ok_or(SpaceMoneyError::NumericalOverflow)?;
            
            // Update user claimed
            user_account.total_claimed_sol = user_account.total_claimed_sol
                .checked_add(rewards_after_penalty)
                .ok_or(SpaceMoneyError::NumericalOverflow)?;
        },
        TokenType::USDT => {
            let platform_token_account = ctx.accounts.platform_token_account.as_ref()
                .ok_or(SpaceMoneyError::InvalidTokenType)?;
            let user_token_account = ctx.accounts.user_token_account.as_ref()
                .ok_or(SpaceMoneyError::InvalidTokenType)?;
            let token_program = ctx.accounts.token_program.as_ref()
                .ok_or(SpaceMoneyError::InvalidTokenType)?;
            
            // Check balance
            require!(
                platform_token_account.amount >= total_withdrawal,
                SpaceMoneyError::InsufficientTreasuryBalance
            );
            
            // Transfer USDT
            let vault_bump = ctx.bumps.vault_authority;
            let seeds = &[VAULT_SEED, &[vault_bump]];
            let signer_seeds = &[&seeds[..]];
            
            let cpi_accounts = Transfer {
                from: platform_token_account.to_account_info(),
                to: user_token_account.to_account_info(),
                authority: ctx.accounts.vault_authority.to_account_info(),
            };
            let cpi_ctx = CpiContext::new_with_signer(
                token_program.to_account_info(),
                cpi_accounts,
                signer_seeds,
            );
            token::transfer(cpi_ctx, total_withdrawal)?;
            
            // Add penalty to treasury
            platform_state.treasury_usdt = platform_state.treasury_usdt
                .checked_add(penalty)
                .ok_or(SpaceMoneyError::NumericalOverflow)?;
            
            // Update user claimed
            user_account.total_claimed_usdt = user_account.total_claimed_usdt
                .checked_add(rewards_after_penalty)
                .ok_or(SpaceMoneyError::NumericalOverflow)?;
        },
    }
    
    // Mark stake as inactive
    stake.is_active = false;
    
    emit!(ForceWithdrewEvent {
        user: ctx.accounts.user.key(),
        stake_index,
        principal: stake.amount,
        rewards_after_penalty,
        penalty,
        token_type: stake.token_type,
        timestamp: clock.unix_timestamp,
    });
    
    Ok(())
}
