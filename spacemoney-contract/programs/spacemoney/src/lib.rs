use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod events;
pub mod instructions;
pub mod states;
pub mod utils;

use instructions::*;

declare_id!("SpaceMoneyProgram11111111111111111111111");

#[program]
pub mod spacemoney {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, usdt_mint: Pubkey) -> Result<()> {
        instructions::initialize::handler(ctx, usdt_mint)
    }

    pub fn deposit_sol(ctx: Context<DepositSol>, amount: u64, tier: u8) -> Result<()> {
        instructions::deposit_sol::handler(ctx, amount, tier)
    }

    pub fn deposit_usdt(ctx: Context<DepositUsdt>, amount: u64, tier: u8) -> Result<()> {
        instructions::deposit_usdt::handler(ctx, amount, tier)
    }

    pub fn withdraw_sol(ctx: Context<WithdrawSol>, stake_index: u64) -> Result<()> {
        instructions::withdraw_sol::handler(ctx, stake_index)
    }

    pub fn withdraw_usdt(ctx: Context<WithdrawUsdt>, stake_index: u64) -> Result<()> {
        instructions::withdraw_usdt::handler(ctx, stake_index)
    }

    pub fn force_withdraw(ctx: Context<ForceWithdraw>, stake_index: u64) -> Result<()> {
        instructions::force_withdraw::handler(ctx, stake_index)
    }

    pub fn claim_rewards(ctx: Context<ClaimRewards>, stake_index: u64) -> Result<()> {
        instructions::claim_rewards::handler(ctx, stake_index)
    }

    pub fn admin_transfer(
        ctx: Context<AdminTransfer>,
        amount: u64,
        token_type: u8,
    ) -> Result<()> {
        instructions::admin_transfer::handler(ctx, amount, token_type)
    }

    pub fn set_admin(ctx: Context<SetAdmin>) -> Result<()> {
        instructions::set_admin::handler(ctx)
    }

    pub fn update_tier_config(
        ctx: Context<UpdateTierConfig>,
        tier: u8,
        min_stake: u64,
        multiplier: u64,
        lock_days: i64,
    ) -> Result<()> {
        instructions::update_tier_config::handler(ctx, tier, min_stake, multiplier, lock_days)
    }

    pub fn set_usdt_mint(ctx: Context<SetUsdtMint>, usdt_mint: Pubkey) -> Result<()> {
        instructions::set_usdt_mint::handler(ctx, usdt_mint)
    }

    pub fn pause_program(ctx: Context<PauseProgram>) -> Result<()> {
        instructions::pause_program::handler(ctx)
    }

    pub fn resume_program(ctx: Context<ResumeProgram>) -> Result<()> {
        instructions::resume_program::handler(ctx)
    }
}
