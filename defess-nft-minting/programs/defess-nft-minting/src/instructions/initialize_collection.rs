use anchor_lang::prelude::*;
use crate::state::NFTCollection;

#[derive(Accounts)]
pub struct InitializeCollection<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = NFTCollection::LEN,
        seeds = [b"collection"],
        bump
    )]
    pub collection: Account<'info, NFTCollection>,

    pub system_program: Program<'info, System>,
}

impl<'info> InitializeCollection<'info> {
    pub fn initialize(&mut self, bumps: &InitializeCollectionBumps) -> Result<()> {
        let collection = &mut self.collection;
        
        // Initialize collection data
        collection.authority = self.authority.key();
        collection.collection_name = "Defess 30-Min Winners NFT Collection".to_string();
        collection.total_minted = 0;
        collection.total_periods = 0;
        collection.created_at = Clock::get()?.unix_timestamp;
        collection.bump = bumps.collection;

        msg!(
            "NFT Collection initialized: {} by authority: {}",
            collection.collection_name,
            collection.authority
        );

        Ok(())
    }
}
