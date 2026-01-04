use anchor_lang::prelude::*;

#[error_code]
pub enum SpaceMoneyError {
    #[msg("Program is currently paused")]
    ProgramPaused,
    
    #[msg("Unauthorized: Only admin can perform this action")]
    Unauthorized,
    
    #[msg("Invalid tier selected")]
    InvalidTier,
    
    #[msg("Stake amount below minimum requirement for tier")]
    InsufficientStakeAmount,
    
    #[msg("Stake is still locked")]
    StakeLocked,
    
    #[msg("Invalid stake index")]
    InvalidStakeIndex,
    
    #[msg("Stake not found")]
    StakeNotFound,
    
    #[msg("Insufficient treasury balance")]
    InsufficientTreasuryBalance,
    
    #[msg("Insufficient user balance")]
    InsufficientBalance,
    
    #[msg("Numerical overflow occurred")]
    NumericalOverflow,
    
    #[msg("Invalid USDT mint address")]
    InvalidUsdtMint,
    
    #[msg("Token account owner mismatch")]
    TokenAccountOwnerMismatch,
    
    #[msg("Invalid token type")]
    InvalidTokenType,
    
    #[msg("Calculation error")]
    CalculationError,
    
    #[msg("Already claimed maximum rewards")]
    MaxRewardsClaimed,
    
    #[msg("No rewards available to claim")]
    NoRewardsAvailable,
}
