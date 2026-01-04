use anchor_lang::prelude::*;
use crate::constants::*;
use crate::errors::SpaceMoneyError;
use crate::states::*;

#[derive(Accounts)]
pub struct SetUsdtMint<'info> {
    #[account(
        mut,
        seeds = [PLATFORM_SEED],
        bump = platform_state.bump,
        constraint = platform_state.admin == admin.key() @ SpaceMoneyError::Unauthorized
    )]
    pub platform_state: Account<'info, PlatformState>,
    
    #[account(mut)]
    pub admin: Signer<'info>,
}

pub fn handler(ctx: Context<SetUsdtMint>, usdt_mint: Pubkey) -> Result<()> {
    let platform_state = &mut ctx.accounts.platform_state;
    platform_state.usdt_mint = usdt_mint;
    Ok(())
}
