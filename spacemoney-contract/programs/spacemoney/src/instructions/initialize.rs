use anchor_lang::prelude::*;
use crate::constants::*;
use crate::events::InitializedEvent;
use crate::states::*;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = admin,
        space = PlatformState::LEN,
        seeds = [PLATFORM_SEED],
        bump
    )]
    pub platform_state: Account<'info, PlatformState>,
    
    #[account(
        init,
        payer = admin,
        space = TierConfig::LEN,
        seeds = [TIERS_SEED],
        bump
    )]
    pub tier_config: Account<'info, TierConfig>,
    
    #[account(mut)]
    pub admin: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Initialize>, usdt_mint: Pubkey) -> Result<()> {
    let platform_state = &mut ctx.accounts.platform_state;
    let tier_config = &mut ctx.accounts.tier_config;
    let clock = Clock::get()?;
    
    // Initialize platform state
    platform_state.admin = ctx.accounts.admin.key();
    platform_state.treasury_sol = 0;
    platform_state.treasury_usdt = 0;
    platform_state.total_staked_sol = 0;
    platform_state.total_staked_usdt = 0;
    platform_state.usdt_mint = usdt_mint;
    platform_state.is_paused = false;
    platform_state.created_at = clock.unix_timestamp;
    platform_state.bump = ctx.bumps.platform_state;
    
    // Initialize tier config with default values
    tier_config.boot_min_stake = BOOT_MIN_STAKE;
    tier_config.boot_multiplier = BOOT_MULTIPLIER;
    tier_config.boot_lock_days = BOOT_LOCK_DAYS;
    
    tier_config.symbiotic_min_stake = SYMBIOTIC_MIN_STAKE;
    tier_config.symbiotic_multiplier = SYMBIOTIC_MULTIPLIER;
    tier_config.symbiotic_lock_days = SYMBIOTIC_LOCK_DAYS;
    
    tier_config.space_min_stake = SPACE_MIN_STAKE;
    tier_config.space_multiplier = SPACE_MULTIPLIER;
    tier_config.space_lock_days = SPACE_LOCK_DAYS;
    
    tier_config.bump = ctx.bumps.tier_config;
    
    emit!(InitializedEvent {
        admin: ctx.accounts.admin.key(),
        timestamp: clock.unix_timestamp,
    });
    
    Ok(())
}
