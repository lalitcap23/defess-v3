use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("This post does not have more likes than the current winner")]
    NotBetterPost,
    
    #[msg("NFT has already been minted for this daily winner")]
    AlreadyMinted,
    
    #[msg("Invalid day timestamp provided")]
    InvalidDay,
    
    #[msg("Winner selection period has not ended yet")]
    SelectionPeriodActive,
    
    #[msg("No posts found for the specified day")]
    NoPostsForDay,
}
