use anchor_lang::prelude::*;

#[account]
pub struct NFTCollection {
    pub authority: Pubkey,
    pub collection_name: String,
    pub total_minted: u64,
    pub total_periods: u64,
    pub created_at: i64,
    pub bump: u8,
}

impl NFTCollection {
    pub const LEN: usize = 8 + // discriminator
        32 + // authority pubkey
        4 + 32 + // collection_name string (max 32 chars)
        8 + // total_minted u64
        8 + // total_periods u64
        8 + // created_at i64
        1; // bump u8
}

#[account]
pub struct DefessNFT {
    pub collection: Pubkey,
    pub winner_post_id: String,
    pub winner_username: String,
    pub like_count: u64,
    pub minted_at: i64,
    pub period_timestamp: i64,
    pub bump: u8,
}

impl DefessNFT {
    pub const LEN: usize = 8 + // discriminator
        32 + // collection pubkey
        4 + 64 + // winner_post_id string (max 64 chars)
        4 + 32 + // winner_username string (max 32 chars)
        8 + // like_count u64
        8 + // minted_at i64
        8 + // period_timestamp i64
        1; // bump u8
}

#[account]
pub struct Winner30Min {
    pub period_timestamp: i64,
    pub winner_username: String,
    pub post_id: String,
    pub like_count: u64,
    pub has_been_minted: bool,
    pub bump: u8,
}

impl Winner30Min {
    pub const LEN: usize = 8 + // discriminator
        8 + // period_timestamp i64
        4 + 32 + // winner_username string (max 32 chars)
        4 + 64 + // post_id string (max 64 chars)
        8 + // like_count u64
        1 + // has_been_minted bool
        1; // bump u8
}