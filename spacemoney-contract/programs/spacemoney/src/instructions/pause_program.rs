use anchor_lang::prelude::*;
use crate::constants::*;
use crate::errors::SpaceMoneyError;
use crate::events::ProgramPausedEvent;
use crate::states::*;

#[derive(Accounts)]
pub struct PauseProgram<'info> {
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

pub fn handler(ctx: Context<PauseProgram>) -> Result<()> {
    let platform_state = &mut ctx.accounts.platform_state;
    let clock = Clock::get()?;
    
    platform_state.is_paused = true;
    
    emit!(ProgramPausedEvent {
        admin: ctx.accounts.admin.key(),
        timestamp: clock.unix_timestamp,
    });
    
    Ok(())
}
