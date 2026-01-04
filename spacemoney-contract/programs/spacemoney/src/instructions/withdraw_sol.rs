use anchor_lang::prelude::*;
use crate::constants::*;
use crate::errors::SpaceMoneyError;
use crate::events::{WithdrewEvent, TokenType};
use crate::states::*;
use crate::utils::*;

#[derive(Accounts)]
pub struct WithdrawSol<'info> {
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
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<WithdrawSol>, stake_index: u64) -> Result<()> {
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
    require!(
        stake.token_type == TokenType::SOL,
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
    
    // Check platform has enough balance
    let platform_balance = platform_state.to_account_info().lamports();
    require!(
        platform_balance >= total_withdrawal,
        SpaceMoneyError::InsufficientTreasuryBalance
    );
    
    // Transfer SOL from platform to user
    **platform_state.to_account_info().try_borrow_mut_lamports()? -= total_withdrawal;
    **ctx.accounts.user.to_account_info().try_borrow_mut_lamports()? += total_withdrawal;
    
    // Update platform state
    platform_state.total_staked_sol = platform_state.total_staked_sol
        .checked_sub(stake.amount)
        .ok_or(SpaceMoneyError::NumericalOverflow)?;
    
    // Update user account
    user_account.total_claimed_sol = user_account.total_claimed_sol
        .checked_add(unclaimed_rewards)
        .ok_or(SpaceMoneyError::NumericalOverflow)?;
    
    // Mark stake as inactive
    stake.is_active = false;
    
    emit!(WithdrewEvent {
        user: ctx.accounts.user.key(),
        stake_index,
        principal: stake.amount,
        rewards: unclaimed_rewards,
        token_type: TokenType::SOL,
        timestamp: clock.unix_timestamp,
    });
    
    Ok(())
}
