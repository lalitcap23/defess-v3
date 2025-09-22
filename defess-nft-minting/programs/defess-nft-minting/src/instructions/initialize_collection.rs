use anchor_lang::prelude::*;
use anchor_spl::{
    token::{Mint, Token},
    associated_token::AssociatedToken,
};
use crate::state::*;

#[derive(Accounts)]
pub struct InitializeCollection<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = NFTCollection::LEN,
        seeds = [b"collection"],
        bump
    )]
    pub collection: Account<'info, NFTCollection>,

    #[account(
        init,
        payer = authority,
        mint::decimals = 0,
        mint::authority = collection,
        mint::freeze_authority = collection,
    )]
    pub collection_mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(ctx: Context<InitializeCollection>) -> Result<()> {
    let collection = &mut ctx.accounts.collection;
    collection.authority = ctx.accounts.authority.key();
    collection.collection_mint = ctx.accounts.collection_mint.key();
    collection.total_minted = 0;
    collection.bump = ctx.bumps.collection;

    msg!("Collection initialized with mint: {}", collection.collection_mint);
    Ok(())
}
