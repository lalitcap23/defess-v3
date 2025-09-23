pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("8QYJMZkM5fExjczQxJa567F9c8fu5PqR8rN5jeR5MNFM");

#[program]
pub mod defess_nft_minting {
    use super::*;

  

    pub fn initialize_collection(ctx: Context<InitializeCollection>) -> Result<()> {
        ctx.accounts.initialize(&ctx.bumps)
    }

    pub fn select_period_winner(
        ctx: Context<SelectPeriodWinner>,
        period_timestamp: i64,
        winner_username: String,
        post_id: String,
        like_count: u64,
    ) -> Result<()> {
        ctx.accounts.select_winner(
            period_timestamp,
            winner_username,
            post_id,
            like_count,
            &ctx.bumps,
        )
    }

    pub fn mint_winner_nft(
        ctx: Context<MintWinnerNFT>, 
        period_timestamp: i64,
    ) -> Result<()> {
        ctx.accounts.mint_nft(period_timestamp)
    }
}
