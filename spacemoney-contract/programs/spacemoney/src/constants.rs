// Platform constants
pub const PLATFORM_SEED: &[u8] = b"platform";
pub const USER_SEED: &[u8] = b"user";
pub const TIERS_SEED: &[u8] = b"tiers";
pub const VAULT_SEED: &[u8] = b"vault";

// Fee constants (basis points)
pub const DEPOSIT_FEE_BPS: u64 = 200; // 2%
pub const FORCE_WITHDRAW_PENALTY_BPS: u64 = 2000; // 20%
pub const BPS_DENOMINATOR: u64 = 10000;

// Reward constants
pub const DAILY_YIELD_BPS: u64 = 100; // 1% daily
pub const SECONDS_PER_DAY: i64 = 86400;

// Tier constants
pub const BOOT_MIN_STAKE: u64 = 1_000_000_000; // 1 SOL
pub const SYMBIOTIC_MIN_STAKE: u64 = 5_000_000_000; // 5 SOL
pub const SPACE_MIN_STAKE: u64 = 25_000_000_000; // 25 SOL

pub const BOOT_MULTIPLIER: u64 = 1;
pub const SYMBIOTIC_MULTIPLIER: u64 = 2;
pub const SPACE_MULTIPLIER: u64 = 3;

pub const BOOT_LOCK_DAYS: i64 = 30;
pub const SYMBIOTIC_LOCK_DAYS: i64 = 90;
pub const SPACE_LOCK_DAYS: i64 = 180;
