-- Database Schema Updates for Defess NFT Winner Selection System
-- Run these SQL commands in your Supabase SQL Editor

-- 1. Create nft_winners table to track period winners
CREATE TABLE nft_winners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Period identification (matches Solana program timestamps)
  period_timestamp BIGINT NOT NULL UNIQUE,
  
  -- Winner information
  post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  like_count INTEGER NOT NULL DEFAULT 0,
  
  -- Processing status
  selected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  mint_status VARCHAR(20) DEFAULT 'pending' CHECK (mint_status IN (
    'pending',      -- Winner selected, waiting for NFT mint
    'minted',       -- NFT successfully minted
    'failed',       -- NFT minting failed
    'empty_period', -- No posts in this period
    'validation_failed' -- Winner validation failed
  )),
  
  -- Solana integration data (for future use)
  mint_address TEXT, -- Solana mint address after minting
  transaction_signature TEXT, -- Solana transaction hash
  
  -- Error tracking
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add NFT winner tracking columns to posts table
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS is_nft_winner BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS winner_period_start TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS nft_mint_address TEXT;

-- 3. Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_nft_winners_period ON nft_winners(period_timestamp);
CREATE INDEX IF NOT EXISTS idx_nft_winners_status ON nft_winners(mint_status);
CREATE INDEX IF NOT EXISTS idx_nft_winners_selected_at ON nft_winners(selected_at);
CREATE INDEX IF NOT EXISTS idx_posts_nft_winner ON posts(is_nft_winner) WHERE is_nft_winner = true;
CREATE INDEX IF NOT EXISTS idx_posts_period_lookup ON posts(created_at, is_nft_winner);

-- 4. Add wallet_address column to users table if it doesn't exist
-- (Skip this if you already have wallet connection in your users table)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS wallet_address TEXT,
ADD COLUMN IF NOT EXISTS wallet_connected_at TIMESTAMP WITH TIME ZONE;

-- 5. Create index for wallet lookups
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address) WHERE wallet_address IS NOT NULL;

-- 6. Create a function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Create trigger for nft_winners updated_at
DROP TRIGGER IF EXISTS update_nft_winners_updated_at ON nft_winners;
CREATE TRIGGER update_nft_winners_updated_at
    BEFORE UPDATE ON nft_winners
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Create view for easy winner queries with user details
CREATE OR REPLACE VIEW nft_winners_detailed AS
SELECT 
  nw.id,
  nw.period_timestamp,
  nw.like_count,
  nw.selected_at,
  nw.mint_status,
  nw.mint_address,
  nw.transaction_signature,
  nw.error_message,
  
  -- Period formatting
  to_timestamp(nw.period_timestamp) as period_start,
  to_timestamp(nw.period_timestamp + 1800) as period_end,
  
  -- Post details
  p.id as post_id,
  p.content as post_content,
  p.created_at as post_created_at,
  
  -- User details  
  u.id as user_id,
  u.username,
  u.wallet_address,
  
  -- Stats
  (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as current_like_count

FROM nft_winners nw
LEFT JOIN posts p ON nw.post_id = p.id
LEFT JOIN users u ON nw.user_id = u.id
ORDER BY nw.selected_at DESC;

-- 9. Grant permissions (adjust as needed for your setup)
-- These are example permissions - modify based on your auth setup

-- Allow authenticated users to read winner data
GRANT SELECT ON nft_winners_detailed TO authenticated;
GRANT SELECT ON nft_winners TO authenticated;

-- Allow service role (for backend operations) to manage winner data
GRANT ALL ON nft_winners TO service_role;
GRANT USAGE ON SEQUENCE nft_winners_id_seq TO service_role;

-- 10. Insert some test data (optional - remove in production)
-- This helps verify the system works before real winners are selected

/*
INSERT INTO nft_winners (
  period_timestamp,
  post_id,
  user_id, 
  like_count,
  mint_status
) VALUES (
  -- Example: period starting at Unix timestamp 1695340800 (mock data)
  1695340800,
  NULL, -- Set to real post ID for testing
  NULL, -- Set to real user ID for testing  
  0,
  'empty_period'
);
*/

-- 11. Create a function to get current period info (useful for debugging)
CREATE OR REPLACE FUNCTION get_current_period_info()
RETURNS TABLE (
  current_time TIMESTAMP WITH TIME ZONE,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  current_period_timestamp BIGINT,
  previous_period_start TIMESTAMP WITH TIME ZONE,
  previous_period_end TIMESTAMP WITH TIME ZONE,
  previous_period_timestamp BIGINT
) AS $$
DECLARE
  now_ts TIMESTAMP WITH TIME ZONE := NOW();
  period_duration INTERVAL := '30 minutes';
  current_period_start_ts TIMESTAMP WITH TIME ZONE;
  previous_period_start_ts TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculate current 30-minute period start
  current_period_start_ts := DATE_TRUNC('hour', now_ts) + 
    (EXTRACT(MINUTE FROM now_ts)::INT / 30) * INTERVAL '30 minutes';
  
  -- Calculate previous period start  
  previous_period_start_ts := current_period_start_ts - period_duration;
  
  RETURN QUERY SELECT
    now_ts,
    current_period_start_ts,
    current_period_start_ts + period_duration,
    EXTRACT(EPOCH FROM current_period_start_ts)::BIGINT,
    previous_period_start_ts,
    current_period_start_ts,
    EXTRACT(EPOCH FROM previous_period_start_ts)::BIGINT;
END;
$$ LANGUAGE plpgsql;

-- Test the function
-- SELECT * FROM get_current_period_info();

COMMENT ON TABLE nft_winners IS 'Tracks 30-minute period winners for NFT minting';
COMMENT ON COLUMN nft_winners.period_timestamp IS 'Unix timestamp of period start (must be divisible by 1800)';
COMMENT ON COLUMN nft_winners.mint_status IS 'Status of NFT minting process';
COMMENT ON VIEW nft_winners_detailed IS 'Complete winner information with user and post details';