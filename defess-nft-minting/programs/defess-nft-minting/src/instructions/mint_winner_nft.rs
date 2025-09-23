use anchor_lang::prelude::*;
use anchor_spl::{
    token::{Mint, Token, TokenAccount, MintTo, mint_to},
    associated_token::AssociatedToken,
};
use crate::state::*;

#[derive(Accounts)]
#[instruction(period_timestamp: i64)]
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
        seeds = [b"winner", &period_timestamp.to_le_bytes()],
        bump = winner.bump,
    )]
    pub winner: Account<'info, Winner30Min>,

    #[account(
        init,
        payer = authority,
        space = DefessNFT::LEN,
        seeds = [b"nft", winner.post_id.as_bytes()],
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

impl<'info> MintWinnerNFT<'info> {
    pub fn mint_nft(&mut self, period_timestamp: i64) -> Result<()> {
        // Check if NFT already minted
        require!(!self.winner.has_been_minted, crate::error::ErrorCode::AlreadyMinted);
        require!(self.winner.period_timestamp == period_timestamp, crate::error::ErrorCode::InvalidPeriod);
        
        // Initialize NFT account data
        self.nft_account.collection = self.collection.key();
        self.nft_account.winner_post_id = self.winner.post_id.clone();
        self.nft_account.winner_username = self.winner.winner_username.clone();
        self.nft_account.like_count = self.winner.like_count;
        self.nft_account.minted_at = Clock::get()?.unix_timestamp;
        self.nft_account.period_timestamp = period_timestamp;
        self.nft_account.bump = 0; // Will be set by caller

        // Create collection seeds for signing
        let collection_seeds = &[
            b"collection".as_ref(),
            &[self.collection.bump],
        ];

        // Mint 1 NFT token to winner's account
        mint_to(
            CpiContext::new_with_signer(
                self.token_program.to_account_info(),
                MintTo {
                    mint: self.nft_mint.to_account_info(),
                    to: self.winner_token_account.to_account_info(),
                    authority: self.collection.to_account_info(),
                },
                &[collection_seeds],
            ),
            1,
        )?;

        // Update winner record
        self.winner.has_been_minted = true;

        // Update collection stats
        self.collection.total_minted += 1;

        msg!(
            "NFT minted for 30-min winner {} on period {} with {} likes. Mint: {}",
            self.winner.winner_username,
            period_timestamp,
            self.winner.like_count,
            self.nft_mint.key()
        );

        Ok(())
    }
}