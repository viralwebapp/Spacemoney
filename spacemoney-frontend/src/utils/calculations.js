import { TIERS, DEPOSIT_FEE, FORCE_WITHDRAW_PENALTY } from './constants';

// Calculate deposit fee
export function calculateDepositFee(amount) {
  return amount * DEPOSIT_FEE;
}

// Calculate net deposit amount after fee
export function calculateNetDeposit(amount) {
  const fee = calculateDepositFee(amount);
  return amount - fee;
}

// Calculate total rewards for a stake
export function calculateTotalRewards(principal, tier) {
  const tierConfig = Object.values(TIERS).find(t => t.id === tier);
  if (!tierConfig) return 0;
  
  const { multiplier, lockDays, dailyYield } = tierConfig;
  const dailyReward = principal * multiplier * dailyYield;
  return dailyReward * lockDays;
}

// Calculate daily rewards
export function calculateDailyRewards(principal, tier) {
  const tierConfig = Object.values(TIERS).find(t => t.id === tier);
  if (!tierConfig) return 0;
  
  const { multiplier, dailyYield } = tierConfig;
  return principal * multiplier * dailyYield;
}

// Calculate accrued rewards based on time elapsed
export function calculateAccruedRewards(principal, tier, depositedAt, currentTime = Date.now()) {
  const tierConfig = Object.values(TIERS).find(t => t.id === tier);
  if (!tierConfig) return 0;
  
  const elapsedSeconds = (currentTime - depositedAt) / 1000;
  const elapsedDays = Math.floor(elapsedSeconds / 86400);
  
  if (elapsedDays <= 0) return 0;
  
  const dailyReward = calculateDailyRewards(principal, tier);
  const maxReward = dailyReward * tierConfig.lockDays;
  const accruedReward = dailyReward * elapsedDays;
  
  return Math.min(accruedReward, maxReward);
}

// Calculate force withdraw penalty
export function calculateForceWithdrawPenalty(rewards) {
  return rewards * FORCE_WITHDRAW_PENALTY;
}

// Calculate APY for a tier
export function calculateAPY(tier) {
  const tierConfig = Object.values(TIERS).find(t => t.id === tier);
  if (!tierConfig) return 0;
  
  const { multiplier, dailyYield, lockDays } = tierConfig;
  const totalReturn = multiplier * dailyYield * lockDays;
  const apy = (totalReturn / lockDays) * 365 * 100;
  
  return apy.toFixed(2);
}

// Calculate total return percentage
export function calculateTotalReturn(tier) {
  const tierConfig = Object.values(TIERS).find(t => t.id === tier);
  if (!tierConfig) return 0;
  
  const { multiplier, dailyYield, lockDays } = tierConfig;
  const totalReturn = multiplier * dailyYield * lockDays * 100;
  
  return totalReturn.toFixed(2);
}

// Calculate time remaining until unlock
export function calculateTimeRemaining(lockUntil) {
  const now = Date.now();
  const remaining = lockUntil - now;
  
  if (remaining <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isUnlocked: true };
  }
  
  const seconds = Math.floor(remaining / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  return {
    days,
    hours: hours % 24,
    minutes: minutes % 60,
    seconds: seconds % 60,
    isUnlocked: false,
  };
}

// Validate stake amount for tier
export function validateStakeAmount(amount, tier) {
  const tierConfig = Object.values(TIERS).find(t => t.id === tier);
  if (!tierConfig) {
    return { valid: false, error: "Invalid tier selected" };
  }
  
  if (amount < tierConfig.minStake) {
    return { 
      valid: false, 
      error: `Minimum stake for ${tierConfig.name} is ${tierConfig.minStake} SOL` 
    };
  }
  
  return { valid: true, error: null };
}

// Calculate growth chart data
export function calculateGrowthChartData(principal, tier) {
  const tierConfig = Object.values(TIERS).find(t => t.id === tier);
  if (!tierConfig) return [];
  
  const { lockDays } = tierConfig;
  const dailyReward = calculateDailyRewards(principal, tier);
  
  const data = [];
  const intervals = Math.min(lockDays, 30); // Max 30 data points
  const step = Math.ceil(lockDays / intervals);
  
  for (let day = 0; day <= lockDays; day += step) {
    const rewards = dailyReward * day;
    data.push({
      day,
      principal,
      rewards: parseFloat(rewards.toFixed(6)),
      total: parseFloat((principal + rewards).toFixed(6)),
    });
  }
  
  // Ensure final day is included
  if (data[data.length - 1].day !== lockDays) {
    const rewards = dailyReward * lockDays;
    data.push({
      day: lockDays,
      principal,
      rewards: parseFloat(rewards.toFixed(6)),
      total: parseFloat((principal + rewards).toFixed(6)),
    });
  }
  
  return data;
}
