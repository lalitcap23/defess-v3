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

    #[msg("Invalid authority - only collection authority can perform this action")]
    InvalidAuthority,

    #[msg("Invalid period timestamp - must be in past and aligned to 30-minute periods")]
    InvalidPeriod,

    #[msg("Invalid username provided")]
    InvalidUsername,

    #[msg("Invalid post ID provided")]
    InvalidPostId,

    #[msg("Invalid like count - must be greater than 0")]
    InvalidLikeCount,
}
