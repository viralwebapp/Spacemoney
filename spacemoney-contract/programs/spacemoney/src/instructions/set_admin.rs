use anchor_lang::prelude::*;
use crate::constants::*;
use crate::errors::SpaceMoneyError;
use crate::events::AdminChangedEvent;
use crate::states::*;

#[derive(Accounts)]
pub struct SetAdmin<'info> {
    #[account(
        mut,
        seeds = [PLATFORM_SEED],
        bump = platform_state.bump,
        constraint = platform_state.admin == admin.key() @ SpaceMoneyError::Unauthorized
    )]
    pub platform_state: Account<'info, PlatformState>,
    
    #[account(mut)]
    pub admin: Signer<'info>,
    
    /// CHECK: New admin can be any address
    pub new_admin: AccountInfo<'info>,
}

pub fn handler(ctx: Context<SetAdmin>) -> Result<()> {
    let platform_state = &mut ctx.accounts.platform_state;
    let clock = Clock::get()?;
    
    let old_admin = platform_state.admin;
    platform_state.admin = ctx.accounts.new_admin.key();
    
    emit!(AdminChangedEvent {
        old_admin,
        new_admin: ctx.accounts.new_admin.key(),
        timestamp: clock.unix_timestamp,
    });
    
    Ok(())
}
