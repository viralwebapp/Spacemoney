use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::constants::*;
use crate::errors::SpaceMoneyError;
use crate::events::{ClaimedRewardsEvent, TokenType};
use crate::states::*;
use crate::utils::*;

#[derive(Accounts)]
pub struct ClaimRewards<'info> {
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

pub fn handler(ctx: Context<ClaimRewards>, stake_index: u64) -> Result<()> {
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
    
    // Calculate accrued rewards
    let (_, multiplier, lock_days) = match stake.tier {
        Tier::Boot => (BOOT_MIN_STAKE, BOOT_MULTIPLIER, BOOT_LOCK_DAYS),
        Tier::Symbiotic => (SYMBIOTIC_MIN_STAKE, SYMBIOTIC_MULTIPLIER, SYMBIOTIC_LOCK_DAYS),
        Tier::Space => (SPACE_MIN_STAKE, SPACE_MULTIPLIER, SPACE_LOCK_DAYS),
    };
    
    // Calculate rewards up to current time (but cap at max rewards)
    let max_rewards = calculate_rewards(stake.amount, multiplier, lock_days)?;
    let accrued_rewards = calculate_accrued_rewards(
        stake.amount,
        multiplier,
        stake.deposited_at,
        clock.unix_timestamp,
    )?;
    
    // Cap at max rewards
    let total_available_rewards = if accrued_rewards > max_rewards {
        max_rewards
    } else {
        accrued_rewards
    };
    
    // Calculate claimable amount
    let claimable = total_available_rewards
        .checked_sub(stake.claimed_rewards)
        .ok_or(SpaceMoneyError::CalculationError)?;
    
    require!(claimable > 0, SpaceMoneyError::NoRewardsAvailable);
    
    // Transfer rewards based on token type
    match stake.token_type {
        TokenType::SOL => {
            // Check balance
            let platform_balance = platform_state.to_account_info().lamports();
            require!(
                platform_balance >= claimable,
                SpaceMoneyError::InsufficientTreasuryBalance
            );
            
            // Transfer SOL
            **platform_state.to_account_info().try_borrow_mut_lamports()? -= claimable;
            **ctx.accounts.user.to_account_info().try_borrow_mut_lamports()? += claimable;
            
            // Update user claimed
            user_account.total_claimed_sol = user_account.total_claimed_sol
                .checked_add(claimable)
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
                platform_token_account.amount >= claimable,
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
            token::transfer(cpi_ctx, claimable)?;
            
            // Update user claimed
            user_account.total_claimed_usdt = user_account.total_claimed_usdt
                .checked_add(claimable)
                .ok_or(SpaceMoneyError::NumericalOverflow)?;
        },
    }
    
    // Update stake claimed rewards
    stake.claimed_rewards = stake.claimed_rewards
        .checked_add(claimable)
        .ok_or(SpaceMoneyError::NumericalOverflow)?;
    
    // Update last claim time
    user_account.last_claim_time = clock.unix_timestamp;
    
    emit!(ClaimedRewardsEvent {
        user: ctx.accounts.user.key(),
        stake_index,
        amount: claimable,
        token_type: stake.token_type,
        timestamp: clock.unix_timestamp,
    });
    
    Ok(())
}
