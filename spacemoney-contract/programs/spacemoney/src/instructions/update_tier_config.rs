use anchor_lang::prelude::*;
use crate::constants::*;
use crate::errors::SpaceMoneyError;
use crate::events::TierConfigUpdatedEvent;
use crate::states::*;

#[derive(Accounts)]
pub struct UpdateTierConfig<'info> {
    #[account(
        seeds = [PLATFORM_SEED],
        bump = platform_state.bump,
        constraint = platform_state.admin == admin.key() @ SpaceMoneyError::Unauthorized
    )]
    pub platform_state: Account<'info, PlatformState>,
    
    #[account(
        mut,
        seeds = [TIERS_SEED],
        bump = tier_config.bump
    )]
    pub tier_config: Account<'info, TierConfig>,
    
    #[account(mut)]
    pub admin: Signer<'info>,
}

pub fn handler(
    ctx: Context<UpdateTierConfig>,
    tier: u8,
    min_stake: u64,
    multiplier: u64,
    lock_days: i64,
) -> Result<()> {
    let tier_config = &mut ctx.accounts.tier_config;
    let clock = Clock::get()?;
    
    match tier {
        0 => {
            tier_config.boot_min_stake = min_stake;
            tier_config.boot_multiplier = multiplier;
            tier_config.boot_lock_days = lock_days;
        },
        1 => {
            tier_config.symbiotic_min_stake = min_stake;
            tier_config.symbiotic_multiplier = multiplier;
            tier_config.symbiotic_lock_days = lock_days;
        },
        2 => {
            tier_config.space_min_stake = min_stake;
            tier_config.space_multiplier = multiplier;
            tier_config.space_lock_days = lock_days;
        },
        _ => return Err(SpaceMoneyError::InvalidTier.into()),
    }
    
    emit!(TierConfigUpdatedEvent {
        tier,
        min_stake,
        multiplier,
        lock_days,
        timestamp: clock.unix_timestamp,
    });
    
    Ok(())
}
