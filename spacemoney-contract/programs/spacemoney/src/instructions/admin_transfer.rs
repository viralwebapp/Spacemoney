use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::constants::*;
use crate::errors::SpaceMoneyError;
use crate::events::{AdminTransferredEvent, TokenType};
use crate::states::*;

#[derive(Accounts)]
pub struct AdminTransfer<'info> {
    #[account(
        mut,
        seeds = [PLATFORM_SEED],
        bump = platform_state.bump,
        constraint = platform_state.admin == admin.key() @ SpaceMoneyError::Unauthorized
    )]
    pub platform_state: Account<'info, PlatformState>,
    
    #[account(mut)]
    pub platform_token_account: Option<Account<'info, TokenAccount>>,
    
    /// CHECK: PDA authority for token transfers
    #[account(
        seeds = [VAULT_SEED],
        bump
    )]
    pub vault_authority: AccountInfo<'info>,
    
    /// CHECK: Recipient can be any address
    #[account(mut)]
    pub recipient: AccountInfo<'info>,
    
    #[account(mut)]
    pub recipient_token_account: Option<Account<'info, TokenAccount>>,
    
    #[account(mut)]
    pub admin: Signer<'info>,
    
    pub token_program: Option<Program<'info, Token>>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<AdminTransfer>,
    amount: u64,
    token_type: u8,
) -> Result<()> {
    let platform_state = &mut ctx.accounts.platform_state;
    let clock = Clock::get()?;
    
    let token_type_enum = if token_type == 0 {
        TokenType::SOL
    } else if token_type == 1 {
        TokenType::USDT
    } else {
        return Err(SpaceMoneyError::InvalidTokenType.into());
    };
    
    match token_type_enum {
        TokenType::SOL => {
            // Check treasury balance
            require!(
                platform_state.treasury_sol >= amount,
                SpaceMoneyError::InsufficientTreasuryBalance
            );
            
            // Check platform account balance
            let platform_balance = platform_state.to_account_info().lamports();
            require!(
                platform_balance >= amount,
                SpaceMoneyError::InsufficientTreasuryBalance
            );
            
            // Transfer SOL from platform to recipient
            **platform_state.to_account_info().try_borrow_mut_lamports()? -= amount;
            **ctx.accounts.recipient.try_borrow_mut_lamports()? += amount;
            
            // Update treasury
            platform_state.treasury_sol = platform_state.treasury_sol
                .checked_sub(amount)
                .ok_or(SpaceMoneyError::NumericalOverflow)?;
        },
        TokenType::USDT => {
            let platform_token_account = ctx.accounts.platform_token_account.as_ref()
                .ok_or(SpaceMoneyError::InvalidTokenType)?;
            let recipient_token_account = ctx.accounts.recipient_token_account.as_ref()
                .ok_or(SpaceMoneyError::InvalidTokenType)?;
            let token_program = ctx.accounts.token_program.as_ref()
                .ok_or(SpaceMoneyError::InvalidTokenType)?;
            
            // Check treasury balance
            require!(
                platform_state.treasury_usdt >= amount,
                SpaceMoneyError::InsufficientTreasuryBalance
            );
            
            // Check token account balance
            require!(
                platform_token_account.amount >= amount,
                SpaceMoneyError::InsufficientTreasuryBalance
            );
            
            // Transfer USDT from platform to recipient
            let vault_bump = ctx.bumps.vault_authority;
            let seeds = &[VAULT_SEED, &[vault_bump]];
            let signer_seeds = &[&seeds[..]];
            
            let cpi_accounts = Transfer {
                from: platform_token_account.to_account_info(),
                to: recipient_token_account.to_account_info(),
                authority: ctx.accounts.vault_authority.to_account_info(),
            };
            let cpi_ctx = CpiContext::new_with_signer(
                token_program.to_account_info(),
                cpi_accounts,
                signer_seeds,
            );
            token::transfer(cpi_ctx, amount)?;
            
            // Update treasury
            platform_state.treasury_usdt = platform_state.treasury_usdt
                .checked_sub(amount)
                .ok_or(SpaceMoneyError::NumericalOverflow)?;
        },
    }
    
    emit!(AdminTransferredEvent {
        admin: ctx.accounts.admin.key(),
        recipient: ctx.accounts.recipient.key(),
        amount,
        token_type: token_type_enum,
        timestamp: clock.unix_timestamp,
    });
    
    Ok(())
}
