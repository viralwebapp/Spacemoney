use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::constants::*;
use crate::errors::SpaceMoneyError;
use crate::events::{WithdrewEvent, TokenType};
use crate::states::*;
use crate::utils::*;

#[derive(Accounts)]
pub struct WithdrawUsdt<'info> {
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
        constraint = user_token_account.mint == platform_state.usdt_mint @ SpaceMoneyError::InvalidUsdtMint,
    )]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = platform_token_account.mint == platform_state.usdt_mint @ SpaceMoneyError::InvalidUsdtMint,
    )]
    pub platform_token_account: Account<'info, TokenAccount>,
    
    /// CHECK: PDA authority for token transfers
    #[account(
        seeds = [VAULT_SEED],
        bump
    )]
    pub vault_authority: AccountInfo<'info>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<WithdrawUsdt>, stake_index: u64) -> Result<()> {
    let platform_state = &ctx.accounts.platform_state;
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
    require!(
        stake.token_type == TokenType::USDT,
        SpaceMoneyError::InvalidTokenType
    );
    
    // Check if lock period has passed
    require!(
        clock.unix_timestamp >= stake.lock_until,
        SpaceMoneyError::StakeLocked
    );
    
    // Calculate rewards
    let (_, multiplier, lock_days) = match stake.tier {
        Tier::Boot => (BOOT_MIN_STAKE, BOOT_MULTIPLIER, BOOT_LOCK_DAYS),
        Tier::Symbiotic => (SYMBIOTIC_MIN_STAKE, SYMBIOTIC_MULTIPLIER, SYMBIOTIC_LOCK_DAYS),
        Tier::Space => (SPACE_MIN_STAKE, SPACE_MULTIPLIER, SPACE_LOCK_DAYS),
    };
    
    let total_rewards = calculate_rewards(stake.amount, multiplier, lock_days)?;
    let unclaimed_rewards = total_rewards
        .checked_sub(stake.claimed_rewards)
        .ok_or(SpaceMoneyError::CalculationError)?;
    
    let total_withdrawal = stake.amount
        .checked_add(unclaimed_rewards)
        .ok_or(SpaceMoneyError::NumericalOverflow)?;
    
    // Check platform has enough USDT
    require!(
        ctx.accounts.platform_token_account.amount >= total_withdrawal,
        SpaceMoneyError::InsufficientTreasuryBalance
    );
    
    // Transfer USDT from platform to user
    let vault_bump = ctx.bumps.vault_authority;
    let seeds = &[VAULT_SEED, &[vault_bump]];
    let signer_seeds = &[&seeds[..]];
    
    let cpi_accounts = Transfer {
        from: ctx.accounts.platform_token_account.to_account_info(),
        to: ctx.accounts.user_token_account.to_account_info(),
        authority: ctx.accounts.vault_authority.to_account_info(),
    };
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        cpi_accounts,
        signer_seeds,
    );
    token::transfer(cpi_ctx, total_withdrawal)?;
    
    // Update user account
    user_account.total_claimed_usdt = user_account.total_claimed_usdt
        .checked_add(unclaimed_rewards)
        .ok_or(SpaceMoneyError::NumericalOverflow)?;
    
    // Mark stake as inactive
    stake.is_active = false;
    
    emit!(WithdrewEvent {
        user: ctx.accounts.user.key(),
        stake_index,
        principal: stake.amount,
        rewards: unclaimed_rewards,
        token_type: TokenType::USDT,
        timestamp: clock.unix_timestamp,
    });
    
    Ok(())
}
