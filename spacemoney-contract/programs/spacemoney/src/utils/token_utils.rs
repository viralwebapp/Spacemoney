use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

pub fn transfer_sol<'info>(
    from: &AccountInfo<'info>,
    to: &AccountInfo<'info>,
    system_program: &AccountInfo<'info>,
    amount: u64,
) -> Result<()> {
    let ix = system_program::Transfer {
        from: from.to_account_info(),
        to: to.to_account_info(),
    };
    
    let cpi_ctx = CpiContext::new(system_program.to_account_info(), ix);
    system_program::transfer(cpi_ctx, amount)
}

pub fn transfer_sol_from_pda<'info>(
    from: &AccountInfo<'info>,
    to: &AccountInfo<'info>,
    system_program: &AccountInfo<'info>,
    amount: u64,
    seeds: &[&[&[u8]]],
) -> Result<()> {
    let ix = system_program::Transfer {
        from: from.to_account_info(),
        to: to.to_account_info(),
    };
    
    let cpi_ctx = CpiContext::new_with_signer(
        system_program.to_account_info(),
        ix,
        seeds,
    );
    system_program::transfer(cpi_ctx, amount)
}

pub fn transfer_spl_tokens<'info>(
    from: &Account<'info, TokenAccount>,
    to: &Account<'info, TokenAccount>,
    authority: &AccountInfo<'info>,
    token_program: &Program<'info, Token>,
    amount: u64,
) -> Result<()> {
    let cpi_accounts = Transfer {
        from: from.to_account_info(),
        to: to.to_account_info(),
        authority: authority.to_account_info(),
    };
    
    let cpi_ctx = CpiContext::new(token_program.to_account_info(), cpi_accounts);
    token::transfer(cpi_ctx, amount)
}

pub fn transfer_spl_tokens_from_pda<'info>(
    from: &Account<'info, TokenAccount>,
    to: &Account<'info, TokenAccount>,
    authority: &AccountInfo<'info>,
    token_program: &Program<'info, Token>,
    amount: u64,
    seeds: &[&[&[u8]]],
) -> Result<()> {
    let cpi_accounts = Transfer {
        from: from.to_account_info(),
        to: to.to_account_info(),
        authority: authority.to_account_info(),
    };
    
    let cpi_ctx = CpiContext::new_with_signer(
        token_program.to_account_info(),
        cpi_accounts,
        seeds,
    );
    token::transfer(cpi_ctx, amount)
}
