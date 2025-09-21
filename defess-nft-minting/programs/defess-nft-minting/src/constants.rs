use anchor_lang::prelude::*;

pub const SECONDS_IN_DAY: i64 = 86400;
pub const COLLECTION_SEED: &[u8] = b"collection";
pub const DAILY_WINNER_SEED: &[u8] = b"daily_winner";
pub const NFT_SEED: &[u8] = b"nft";

// Metadata URI base
pub const METADATA_URI_BASE: &str = "https://defess.com/nft";
pub const COLLECTION_URI: &str = "https://defess.com/metadata/collection";

// Collection info
pub const COLLECTION_NAME: &str = "Defess Daily Winners";
pub const COLLECTION_SYMBOL: &str = "DDW";

// Helper function to get day timestamp (midnight UTC)
pub fn get_day_timestamp(unix_timestamp: i64) -> i64 {
    (unix_timestamp / SECONDS_IN_DAY) * SECONDS_IN_DAY
}

#[constant]
pub const SEED: &str = "anchor";
