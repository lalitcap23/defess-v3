use anchor_lang::prelude::*;
use anchor_spl::{
    token::{Mint, Token, TokenAccount, MintTo, mint_to},
    associated_token::AssociatedToken,
};
use crate::state::{NFTCollection, DefessNFT};

#[derive(Accounts)]
#[instruction(period_timestamp: i64, post_id: String)]
pub struct MintWinner30MinNFT<'info> {
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

impl<'info> MintWinner30MinNFT<'info> {
    pub fn mint_nft(
        &mut self,
        period_timestamp: i64,
        post_id: String,
        username: String,
        like_count: u64,
        nft_bump: u8,
    ) -> Result<()> {
        let collection_info = self.collection.to_account_info();
        let collection_bump = self.collection.bump;
        
        let collection = &mut self.collection;
        let nft_account = &mut self.nft_account;
        
        // Initialize NFT account data
        nft_account.collection = collection.key();
        nft_account.winner_post_id = post_id;
        nft_account.winner_username = username;
        nft_account.like_count = like_count;
        nft_account.minted_at = Clock::get()?.unix_timestamp;
        nft_account.period_timestamp = period_timestamp;
        nft_account.bump = nft_bump;

        // Create collection seeds for signing
        let collection_seeds = &[
            b"collection".as_ref(),
            &[collection_bump],
        ];

        // Mint 1 NFT token to winner's account
        mint_to(
            CpiContext::new_with_signer(
                self.token_program.to_account_info(),
                MintTo {
                    mint: self.nft_mint.to_account_info(),
                    to: self.winner_token_account.to_account_info(),
                    authority: collection_info,
                },
                &[collection_seeds],
            ),
            1,
        )?;

        // Update collection stats
        collection.total_minted += 1;

        msg!(
            "NFT minted for 30-min winner {} on period {} with {} likes. Mint: {}",
            nft_account.winner_username,
            period_timestamp,
            like_count,
            self.nft_mint.key()
        );

        Ok(())
    }
}