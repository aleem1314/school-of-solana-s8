//-------------------------------------------------------------------------------
///
/// TASK: Implement the withdraw functionality for the on-chain vault
/// 
/// Requirements:
/// - Verify that the vault is not locked
/// - Verify that the vault has enough balance to withdraw
/// - Transfer lamports from vault to vault authority
/// - Emit a withdraw event after successful transfer
/// 
///-------------------------------------------------------------------------------

use anchor_lang::prelude::*;
use crate::state::Vault;
use crate::errors::VaultError;
use crate::events::WithdrawEvent;

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub vault_authority: Signer<'info>,

    #[account(
        mut,
        seeds=[b"vault",vault_authority.key().as_ref()],
        bump,
        has_one = vault_authority,
    )]
    pub vault: Account<'info, Vault>,

    pub system_program: Program<'info, System>,
}

pub fn _withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    let vault = &mut ctx.accounts.vault;

    require!(!vault.locked, VaultError::VaultLocked);

    let balance = **vault.to_account_info().lamports.borrow();
    require!(balance >= amount, VaultError::InsufficientBalance);


    **vault.to_account_info().try_borrow_mut_lamports()? -= amount;

    let vault_authorit = &mut ctx.accounts.vault_authority;
    **vault_authorit.to_account_info().try_borrow_mut_lamports()? += amount;


    emit!(WithdrawEvent{
        amount,
        vault: vault.key(),
        vault_authority: vault_authorit.key(),
    });
    Ok(())
}