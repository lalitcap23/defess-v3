use anchor_lang::prelude::*;
use anchor_spl::{
    token::{Mint, Token, TokenAccount, MintTo, mint_to},
    associated_token::{AssociatedToken, Create, create},
    metadata::{
        create_metadata_accounts_v3,
        CreateMetadataAccountsV3,
        Metadata as MetaplexMetadata,
    },
};
use mpl_token_metadata::types::{DataV2, Collection};
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
        constraint = !daily_winner.nft_minted @ crate::error::ErrorCode::AlreadyMinted,
        constraint = daily_winner.day_timestamp == day_timestamp @ crate::error::ErrorCode::InvalidDay,
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

    /// CHECK: This is the metadata account for the NFT
    #[account(mut)]
    pub metadata_account: UncheckedAccount<'info>,

    pub collection_mint: Account<'info, Mint>,

    /// CHECK: Collection metadata account
    pub collection_metadata: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub metadata_program: Program<'info, MetaplexMetadata>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(ctx: Context<MintWinnerNFT>, day_timestamp: i64) -> Result<()> {
    let collection = &mut ctx.accounts.collection;
    let daily_winner = &mut ctx.accounts.daily_winner;
    let nft_account = &mut ctx.accounts.nft_account;
    
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

    // Format day for metadata
    let day_date = format_timestamp_to_date(day_timestamp);
    
    // Create NFT metadata
    create_metadata_accounts_v3(
        CpiContext::new_with_signer(
            ctx.accounts.metadata_program.to_account_info(),
            CreateMetadataAccountsV3 {
                metadata: ctx.accounts.metadata_account.to_account_info(),
                mint: ctx.accounts.nft_mint.to_account_info(),
                mint_authority: ctx.accounts.collection.to_account_info(),
                update_authority: ctx.accounts.collection.to_account_info(),
                payer: ctx.accounts.authority.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
            &[collection_seeds],
        ),
        DataV2 {
            name: format!("Defess Daily Winner - {}", day_date),
            symbol: "DDW".to_string(),
            uri: format!("https://defess.com/nft/{}/{}", day_timestamp, daily_winner.post_id),
            seller_fee_basis_points: 0,
            creators: None,
            collection: Some(Collection {
                verified: false,
                key: ctx.accounts.collection_mint.key(),
            }),
            uses: None,
        },
        true, // is_mutable
        true, // update_authority_is_signer
        None, // collection_details
    )?;

    // Update daily winner record
    daily_winner.nft_minted = true;
    daily_winner.nft_mint = Some(ctx.accounts.nft_mint.key());

    // Update collection stats
    collection.total_minted += 1;

    msg!(
        "NFT minted for daily winner {} on {} with {} likes. Mint: {}",
        daily_winner.username,
        day_date,
        daily_winner.like_count,
        ctx.accounts.nft_mint.key()
    );

    Ok(())
}

// Helper function to format timestamp to readable date
fn format_timestamp_to_date(timestamp: i64) -> String {
    // Simple date formatting - in production you might want a more robust solution
    let days_since_epoch = timestamp / 86400; // 86400 seconds in a day
    let epoch_start = 719163; // Days from year 1 to 1970-01-01
    let total_days = epoch_start + days_since_epoch;
    
    // Simple approximation for year/month/day calculation
    let year = 1970 + (days_since_epoch / 365);
    let remaining_days = days_since_epoch % 365;
    let month = (remaining_days / 30) + 1;
    let day = (remaining_days % 30) + 1;
    
    format!("{:04}-{:02}-{:02}", year, month, day)
}