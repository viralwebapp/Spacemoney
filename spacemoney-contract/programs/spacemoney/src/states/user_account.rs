use anchor_lang::prelude::*;

#[account]
pub struct UserAccount {
    pub user: Pubkey,
    pub stakes: Vec<UserStake>,
    pub total_claimed_sol: u64,
    pub total_claimed_usdt: u64,
    pub last_claim_time: i64,
    pub bump: u8,
}

impl UserAccount {
    pub const INITIAL_LEN: usize = 8 + // discriminator
        32 + // user
        4 +  // vec length
        8 +  // total_claimed_sol
        8 +  // total_claimed_usdt
        8 +  // last_claim_time
        1;   // bump

    pub fn space_for_stakes(num_stakes: usize) -> usize {
        Self::INITIAL_LEN + (num_stakes * UserStake::LEN)
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy)]
pub struct UserStake {
    pub amount: u64,
    pub tier: Tier,
    pub token_type: TokenType,
    pub deposited_at: i64,
    pub lock_until: i64,
    pub claimed_rewards: u64,
    pub is_active: bool,
}

impl UserStake {
    pub const LEN: usize = 8 +  // amount
        1 +  // tier
        1 +  // token_type
        8 +  // deposited_at
        8 +  // lock_until
        8 +  // claimed_rewards
        1;   // is_active
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum Tier {
    Boot,
    Symbiotic,
    Space,
}

impl Tier {
    pub fn from_u8(value: u8) -> Option<Self> {
        match value {
            0 => Some(Tier::Boot),
            1 => Some(Tier::Symbiotic),
            2 => Some(Tier::Space),
            _ => None,
        }
    }

    pub fn to_u8(&self) -> u8 {
        match self {
            Tier::Boot => 0,
            Tier::Symbiotic => 1,
            Tier::Space => 2,
        }
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum TokenType {
    SOL,
    USDT,
}
