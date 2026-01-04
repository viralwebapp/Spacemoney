use anchor_lang::prelude::*;

#[event]
pub struct InitializedEvent {
    pub admin: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct DepositedEvent {
    pub user: Pubkey,
    pub amount: u64,
    pub tier: u8,
    pub token_type: TokenType,
    pub fee: u64,
    pub lock_until: i64,
    pub timestamp: i64,
}

#[event]
pub struct WithdrewEvent {
    pub user: Pubkey,
    pub stake_index: u64,
    pub principal: u64,
    pub rewards: u64,
    pub token_type: TokenType,
    pub timestamp: i64,
}

#[event]
pub struct ClaimedRewardsEvent {
    pub user: Pubkey,
    pub stake_index: u64,
    pub amount: u64,
    pub token_type: TokenType,
    pub timestamp: i64,
}

#[event]
pub struct ForceWithdrewEvent {
    pub user: Pubkey,
    pub stake_index: u64,
    pub principal: u64,
    pub rewards_after_penalty: u64,
    pub penalty: u64,
    pub token_type: TokenType,
    pub timestamp: i64,
}

#[event]
pub struct AdminTransferredEvent {
    pub admin: Pubkey,
    pub recipient: Pubkey,
    pub amount: u64,
    pub token_type: TokenType,
    pub timestamp: i64,
}

#[event]
pub struct AdminChangedEvent {
    pub old_admin: Pubkey,
    pub new_admin: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct ProgramPausedEvent {
    pub admin: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct ProgramResumedEvent {
    pub admin: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct TierConfigUpdatedEvent {
    pub tier: u8,
    pub min_stake: u64,
    pub multiplier: u64,
    pub lock_days: i64,
    pub timestamp: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum TokenType {
    SOL,
    USDT,
}
