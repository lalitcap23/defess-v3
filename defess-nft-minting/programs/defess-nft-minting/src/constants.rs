pub const SECONDS_IN_PERIOD: i64 = 1800; 
pub const COLLECTION_SEED: &[u8] = b"collection";
pub const WINNER_30MIN_SEED: &[u8] = b"winner_30min";
pub const NFT_SEED: &[u8] = b"nft";

// Metadata URI base
pub const METADATA_URI_BASE: &str = "https://defess.com/nft";// i will have to  change it
pub const COLLECTION_URI: &str = "https://defess.com/metadata/collection";// i will have to  change it 

// Collection info
pub const COLLECTION_NAME: &str = "Defess Daily Winners";
pub const COLLECTION_SYMBOL: &str = "DDW";

// Helper function to get period timestamp (30-min periods from midnight UTC)
pub fn get_period_timestamp(unix_timestamp: i64) -> i64 {
    (unix_timestamp / SECONDS_IN_PERIOD) * SECONDS_IN_PERIOD
}

pub const SEED: &str = "anchor";
