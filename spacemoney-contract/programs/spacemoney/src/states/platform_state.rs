use anchor_lang::prelude::*;

#[account]
pub struct PlatformState {
    pub admin: Pubkey,
    pub treasury_sol: u64,
    pub treasury_usdt: u64,
    pub total_staked_sol: u64,
    pub total_staked_usdt: u64,
    pub usdt_mint: Pubkey,
    pub is_paused: bool,
    pub created_at: i64,
    pub bump: u8,
}

impl PlatformState {
    pub const LEN: usize = 8 + // discriminator
        32 + // admin
        8 +  // treasury_sol
        8 +  // treasury_usdt
        8 +  // total_staked_sol
        8 +  // total_staked_usdt
        32 + // usdt_mint
        1 +  // is_paused
        8 +  // created_at
        1;   // bump
}
