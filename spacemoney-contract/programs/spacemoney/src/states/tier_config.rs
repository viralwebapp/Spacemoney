use anchor_lang::prelude::*;

#[account]
pub struct TierConfig {
    pub boot_min_stake: u64,
    pub boot_multiplier: u64,
    pub boot_lock_days: i64,
    
    pub symbiotic_min_stake: u64,
    pub symbiotic_multiplier: u64,
    pub symbiotic_lock_days: i64,
    
    pub space_min_stake: u64,
    pub space_multiplier: u64,
    pub space_lock_days: i64,
    
    pub bump: u8,
}

impl TierConfig {
    pub const LEN: usize = 8 + // discriminator
        8 + 8 + 8 + // boot
        8 + 8 + 8 + // symbiotic
        8 + 8 + 8 + // space
        1;          // bump
}
