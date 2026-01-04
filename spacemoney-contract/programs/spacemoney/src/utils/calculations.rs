use crate::constants::*;
use crate::errors::SpaceMoneyError;
use anchor_lang::prelude::*;

pub fn calculate_deposit_fee(amount: u64) -> Result<u64> {
    amount
        .checked_mul(DEPOSIT_FEE_BPS)
        .and_then(|v| v.checked_div(BPS_DENOMINATOR))
        .ok_or(SpaceMoneyError::NumericalOverflow.into())
}

pub fn calculate_net_deposit(amount: u64) -> Result<(u64, u64)> {
    let fee = calculate_deposit_fee(amount)?;
    let net_amount = amount
        .checked_sub(fee)
        .ok_or(SpaceMoneyError::NumericalOverflow)?;
    Ok((net_amount, fee))
}

pub fn calculate_rewards(
    principal: u64,
    multiplier: u64,
    days_locked: i64,
) -> Result<u64> {
    // Formula: principal × multiplier × 1% × days
    // Breaking it down to avoid overflow
    let base_daily = principal
        .checked_mul(multiplier)
        .ok_or(SpaceMoneyError::CalculationError)?;
    
    let daily_reward = base_daily
        .checked_mul(DAILY_YIELD_BPS)
        .and_then(|v| v.checked_div(BPS_DENOMINATOR))
        .ok_or(SpaceMoneyError::CalculationError)?;
    
    let total_reward = daily_reward
        .checked_mul(days_locked as u64)
        .ok_or(SpaceMoneyError::CalculationError)?;
    
    Ok(total_reward)
}

pub fn calculate_accrued_rewards(
    principal: u64,
    multiplier: u64,
    start_time: i64,
    current_time: i64,
) -> Result<u64> {
    let elapsed_seconds = current_time
        .checked_sub(start_time)
        .ok_or(SpaceMoneyError::CalculationError)?;
    
    let elapsed_days = elapsed_seconds / SECONDS_PER_DAY;
    
    if elapsed_days <= 0 {
        return Ok(0);
    }
    
    calculate_rewards(principal, multiplier, elapsed_days)
}

pub fn calculate_force_withdraw_penalty(rewards: u64) -> Result<u64> {
    rewards
        .checked_mul(FORCE_WITHDRAW_PENALTY_BPS)
        .and_then(|v| v.checked_div(BPS_DENOMINATOR))
        .ok_or(SpaceMoneyError::CalculationError.into())
}

pub fn get_tier_config(tier: u8) -> Result<(u64, u64, i64)> {
    match tier {
        0 => Ok((BOOT_MIN_STAKE, BOOT_MULTIPLIER, BOOT_LOCK_DAYS)),
        1 => Ok((SYMBIOTIC_MIN_STAKE, SYMBIOTIC_MULTIPLIER, SYMBIOTIC_LOCK_DAYS)),
        2 => Ok((SPACE_MIN_STAKE, SPACE_MULTIPLIER, SPACE_LOCK_DAYS)),
        _ => Err(SpaceMoneyError::InvalidTier.into()),
    }
}

pub fn validate_stake_amount(amount: u64, tier: u8) -> Result<()> {
    let (min_stake, _, _) = get_tier_config(tier)?;
    
    if amount < min_stake {
        return Err(SpaceMoneyError::InsufficientStakeAmount.into());
    }
    
    Ok(())
}
