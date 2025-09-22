use anchor_lang::prelude::*;
use anchor_spl::{
    token::{Mint, Token, TokenAccount, MintTo, mint_to},
    associated_token::AssociatedToken,
};
use crate::state::{NFTCollection, DefessNFT};

#[derive(Accounts)]
#[instruction(day_timestamp: i64, post_id: String)]
pub struct MintDailyWinnerNFT<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        seeds = [b"collection"],
        bump = collection.bump,
        mut
    )]
    pub collection: Account<'info, NFTCollection>,

    #[account(
        init,
        payer = authority,
        space = DefessNFT::LEN,
        seeds = [b"nft", post_id.as_bytes()],
        bump
    )]
    pub nft_account: Account<'info, DefessNFT>,

    #[account(
        init,
        payer = authority,
        mint::decimals = 0,
        mint::authority = collection,
        mint::freeze_authority = collection,
    )]
    pub nft_mint: Account<'info, Mint>,

    /// CHECK: Winner's wallet address to receive the NFT
    pub winner_wallet: UncheckedAccount<'info>,

    #[account(
        init,
        payer = authority,
        associated_token::mint = nft_mint,
        associated_token::authority = winner_wallet,
    )]
    pub winner_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(
    ctx: Context<MintDailyWinnerNFT>, 
    day_timestamp: i64,
    post_id: String,
    username: String,
    like_count: u64,
    nft_bump: u8,
) -> Result<()> {
    let collection_info = ctx.accounts.collection.to_account_info();
    let collection_bump = ctx.accounts.collection.bump;
    
    let collection = &mut ctx.accounts.collection;
    let nft_account = &mut ctx.accounts.nft_account;
    
    // Initialize NFT account data
    nft_account.collection = collection.key();
    nft_account.winner_post_id = post_id;
    nft_account.winner_username = username;
    nft_account.like_count = like_count;
    nft_account.minted_at = Clock::get()?.unix_timestamp;
    nft_account.day_timestamp = day_timestamp;
    nft_account.bump = nft_bump;

    // Create collection seeds for signing
    let collection_seeds = &[
        b"collection".as_ref(),
        &[collection_bump],
    ];

    // Mint 1 NFT token to winner's account
    mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.nft_mint.to_account_info(),
                to: ctx.accounts.winner_token_account.to_account_info(),
                authority: collection_info,
            },
            &[collection_seeds],
        ),
        1,
    )?;

    // Update collection stats
    collection.total_minted += 1;

    msg!(
        "NFT minted for daily winner {} on day {} with {} likes. Mint: {}",
        nft_account.winner_username,
        day_timestamp,
        like_count,
        ctx.accounts.nft_mint.key()
    );

    Ok(())
}