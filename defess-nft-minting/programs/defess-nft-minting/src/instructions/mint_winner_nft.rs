use anchor_lang::prelude::*;
use anchor_spl::{
    token::{Mint, Token, TokenAccount, MintTo, mint_to},
    associated_token::AssociatedToken,
};
use crate::state::*;

#[derive(Accounts)]
#[instruction(day_timestamp: i64)]
pub struct MintWinnerNFT<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        seeds = [b"collection"],
        bump = collection.bump,
        mut
    )]
    pub collection: Account<'info, NFTCollection>,

    #[account(
        mut,
        seeds = [b"daily_winner", &day_timestamp.to_le_bytes()],
        bump = daily_winner.bump,
    )]
    pub daily_winner: Account<'info, DailyWinner>,

    #[account(
        init,
        payer = authority,
        space = DefessNFT::LEN,
        seeds = [b"nft", daily_winner.post_id.as_bytes()],
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
        init_if_needed,
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

pub fn handler(ctx: Context<MintWinnerNFT>, day_timestamp: i64) -> Result<()> {
    let collection = &mut ctx.accounts.collection;
    let daily_winner = &mut ctx.accounts.daily_winner;
    let nft_account = &mut ctx.accounts.nft_account;
    
    // Check if NFT already minted
    require!(!daily_winner.nft_minted, crate::error::ErrorCode::AlreadyMinted);
    require!(daily_winner.day_timestamp == day_timestamp, crate::error::ErrorCode::InvalidDay);
    
    // Initialize NFT account data
    nft_account.collection = collection.key();
    nft_account.winner_post_id = daily_winner.post_id.clone();
    nft_account.winner_username = daily_winner.username.clone();
    nft_account.like_count = daily_winner.like_count;
    nft_account.minted_at = Clock::get()?.unix_timestamp;
    nft_account.day_timestamp = day_timestamp;
    nft_account.bump = ctx.bumps.nft_account;

    // Create collection seeds for signing
    let collection_seeds = &[
        b"collection",
        &[collection.bump],
    ];

    // Mint 1 NFT token to winner's account
    mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.nft_mint.to_account_info(),
                to: ctx.accounts.winner_token_account.to_account_info(),
                authority: ctx.accounts.collection.to_account_info(),
            },
            &[collection_seeds],
        ),
        1,
    )?;

    // Update daily winner record
    daily_winner.nft_minted = true;
    daily_winner.nft_mint = Some(ctx.accounts.nft_mint.key());

    // Update collection stats
    collection.total_minted += 1;

    msg!(
        "NFT minted for daily winner {} on day {} with {} likes. Mint: {}",
        daily_winner.username,
        day_timestamp,
        daily_winner.like_count,
        ctx.accounts.nft_mint.key()
    );

    Ok(())
}