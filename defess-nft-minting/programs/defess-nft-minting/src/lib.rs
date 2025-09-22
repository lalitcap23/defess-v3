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

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        initialize::handler(ctx)
    }

    pub fn initialize_collection(ctx: Context<InitializeCollection>) -> Result<()> {
        initialize_collection::handler(ctx)
    }

    pub fn mint_daily_winner_nft(
        ctx: Context<MintDailyWinnerNFT>, 
        day_timestamp: i64,
        post_id: String,
        username: String,
        like_count: u64,
        nft_bump: u8,
    ) -> Result<()> {
        mint_daily_winner_nft::handler(ctx, day_timestamp, post_id, username, like_count, nft_bump)
    }
}
