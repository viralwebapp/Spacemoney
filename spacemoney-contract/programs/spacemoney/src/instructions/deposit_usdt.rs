use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::constants::*;
use crate::errors::SpaceMoneyError;
use crate::events::{DepositedEvent, TokenType};
use crate::states::*;
use crate::utils::*;

#[derive(Accounts)]
pub struct DepositUsdt<'info> {
    #[account(
        mut,
        seeds = [PLATFORM_SEED],
        bump = platform_state.bump
    )]
    pub platform_state: Account<'info, PlatformState>,
    
    #[account(
        init_if_needed,
        payer = user,
        space = UserAccount::space_for_stakes(10),
        seeds = [USER_SEED, user.key().as_ref()],
        bump
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
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<DepositUsdt>, amount: u64, tier: u8) -> Result<()> {
    let platform_state = &mut ctx.accounts.platform_state;
    let user_account = &mut ctx.accounts.user_account;
    let clock = Clock::get()?;
    
    // Check if program is paused
    require!(!platform_state.is_paused, SpaceMoneyError::ProgramPaused);
    
    // Validate tier and amount
    validate_stake_amount(amount, tier)?;
    
    // Calculate fee and net deposit
    let (net_amount, fee) = calculate_net_deposit(amount)?;
    
    // Get tier configuration
    let (_, multiplier, lock_days) = get_tier_config(tier)?;
    let lock_until = clock.unix_timestamp
        .checked_add(lock_days * SECONDS_PER_DAY)
        .ok_or(SpaceMoneyError::NumericalOverflow)?;
    
    // Transfer USDT from user to platform
    let cpi_accounts = Transfer {
        from: ctx.accounts.user_token_account.to_account_info(),
        to: ctx.accounts.platform_token_account.to_account_info(),
        authority: ctx.accounts.user.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        cpi_accounts,
    );
    token::transfer(cpi_ctx, amount)?;
    
    // Update platform state
    platform_state.treasury_usdt = platform_state.treasury_usdt
        .checked_add(fee)
        .ok_or(SpaceMoneyError::NumericalOverflow)?;
    platform_state.total_staked_usdt = platform_state.total_staked_usdt
        .checked_add(net_amount)
        .ok_or(SpaceMoneyError::NumericalOverflow)?;
    
    // Initialize user account if needed
    if user_account.user == Pubkey::default() {
        user_account.user = ctx.accounts.user.key();
        user_account.stakes = Vec::new();
        user_account.total_claimed_sol = 0;
        user_account.total_claimed_usdt = 0;
        user_account.last_claim_time = clock.unix_timestamp;
        user_account.bump = ctx.bumps.user_account;
    }
    
    // Create stake
    let tier_enum = Tier::from_u8(tier).ok_or(SpaceMoneyError::InvalidTier)?;
    let stake = UserStake {
        amount: net_amount,
        tier: tier_enum,
        token_type: TokenType::USDT,
        deposited_at: clock.unix_timestamp,
        lock_until,
        claimed_rewards: 0,
        is_active: true,
    };
    
    user_account.stakes.push(stake);
    
    emit!(DepositedEvent {
        user: ctx.accounts.user.key(),
        amount: net_amount,
        tier,
        token_type: TokenType::USDT,
        fee,
        lock_until,
        timestamp: clock.unix_timestamp,
    });
    
    Ok(())
}
