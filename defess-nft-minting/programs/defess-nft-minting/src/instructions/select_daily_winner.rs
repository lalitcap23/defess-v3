use anchor_lang::prelude::*;
use crate::state::{NFTCollection, Winner30Min};
use crate::error::ErrorCode;

#[derive(Accounts)]
#[instruction(period_timestamp: i64)]
pub struct SelectPeriodWinner<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"collection"],
        bump = collection.bump,
        has_one = authority @ ErrorCode::InvalidAuthority
    )]
    pub collection: Account<'info, NFTCollection>,

    #[account(
        init,
        payer = authority,
        space = Winner30Min::LEN,
        seeds = [b"winner", period_timestamp.to_le_bytes().as_ref()],
        bump
    )]
    pub winner_account: Account<'info, Winner30Min>,

    pub system_program: Program<'info, System>,
}

impl<'info> SelectPeriodWinner<'info> {
    pub fn select_winner(
        &mut self,
        period_timestamp: i64,
        winner_username: String,
        post_id: String,
        like_count: u64,
        bumps: &SelectPeriodWinnerBumps,
    ) -> Result<()> {
        // Validate period timestamp (must be in the past and aligned to 30-min periods)
        let current_time = Clock::get()?.unix_timestamp;
        require!(period_timestamp < current_time, ErrorCode::InvalidPeriod);
        require!(period_timestamp % 1800 == 0, ErrorCode::InvalidPeriod);

        // Validate input data
        require!(!winner_username.is_empty(), ErrorCode::InvalidUsername);
        require!(!post_id.is_empty(), ErrorCode::InvalidPostId);
        require!(like_count > 0, ErrorCode::InvalidLikeCount);

        // Initialize winner account
        let winner = &mut self.winner_account;
        winner.period_timestamp = period_timestamp;
        winner.winner_username = winner_username.clone();
        winner.post_id = post_id.clone();
        winner.like_count = like_count;
        winner.has_been_minted = false;
        winner.bump = bumps.winner_account;

        let collection = &mut self.collection;
        collection.total_periods += 1;

        msg!(
            "Period winner selected: {} with {} likes for period {}",
            winner_username,
            like_count,
            period_timestamp
        );

        Ok(())
    }
}