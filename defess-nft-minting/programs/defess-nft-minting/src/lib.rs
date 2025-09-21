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

    pub fn select_daily_winner(
        ctx: Context<SelectDailyWinner>, 
        day_timestamp: i64,
        post_data: PostData,
    ) -> Result<()> {
        select_daily_winner::handler(ctx, day_timestamp, post_data)
    }

    pub fn mint_winner_nft(
        ctx: Context<MintWinnerNFT>, 
        day_timestamp: i64
    ) -> Result<()> {
        mint_winner_nft::handler(ctx, day_timestamp)
    }
}
