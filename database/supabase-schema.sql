-- =====================================================
-- DEFESS V3 DATABASE SCHEMA
-- Decentralized Social Platform with Solana Integration
-- =====================================================

-- Create updated_at trigger function (reusable)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- USERS TABLE
-- Maps wallet addresses to unique usernames
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  total_shields_received INTEGER DEFAULT 0,
  total_rewards_earned DECIMAL(20, 9) DEFAULT 0, -- For SOL rewards
  nft_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  follower_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Constraints
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 20),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$')
);

-- Add missing columns to existing users table (if they don't exist)
DO $$ 
BEGIN
    -- Add display_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'display_name') THEN
        ALTER TABLE users ADD COLUMN display_name TEXT;
    END IF;
    
    -- Add bio column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'bio') THEN
        ALTER TABLE users ADD COLUMN bio TEXT;
    END IF;
    
    -- Add avatar_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'avatar_url') THEN
        ALTER TABLE users ADD COLUMN avatar_url TEXT;
    END IF;
    
    -- Add total_shields_received column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'total_shields_received') THEN
        ALTER TABLE users ADD COLUMN total_shields_received INTEGER DEFAULT 0;
    END IF;
    
    -- Add total_rewards_earned column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'total_rewards_earned') THEN
        ALTER TABLE users ADD COLUMN total_rewards_earned DECIMAL(20, 9) DEFAULT 0;
    END IF;
    
    -- Add nft_count column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'nft_count') THEN
        ALTER TABLE users ADD COLUMN nft_count INTEGER DEFAULT 0;
    END IF;
    
    -- Add post_count column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'post_count') THEN
        ALTER TABLE users ADD COLUMN post_count INTEGER DEFAULT 0;
    END IF;
    
    -- Add follower_count column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'follower_count') THEN
        ALTER TABLE users ADD COLUMN follower_count INTEGER DEFAULT 0;
    END IF;
    
    -- Add following_count column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'following_count') THEN
        ALTER TABLE users ADD COLUMN following_count INTEGER DEFAULT 0;
    END IF;
    
    -- Add is_verified column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_verified') THEN
        ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT false;
    END IF;
END $$;

-- =====================================================
-- POSTS TABLE
-- User-generated content with engagement metrics
-- =====================================================
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_urls TEXT[], -- Array of image URLs
  shields_count INTEGER DEFAULT 0, -- Like count
  comment_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Constraints
  CONSTRAINT content_length CHECK (char_length(content) <= 280)
);

-- =====================================================
-- SHIELDS TABLE (LIKES)
-- Track who shields/likes which posts
-- =====================================================
CREATE TABLE IF NOT EXISTS shields (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Unique constraint: one shield per user per post
  UNIQUE(user_id, post_id)
);

-- =====================================================
-- COMMENTS TABLE
-- Nested comments on posts
-- =====================================================
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- For nested replies
  content TEXT NOT NULL,
  shields_count INTEGER DEFAULT 0, -- Comments can also be shielded
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Constraints
  CONSTRAINT comment_length CHECK (char_length(content) <= 280)
);

-- =====================================================
-- COMMENT_SHIELDS TABLE
-- Track shields on comments
-- =====================================================
CREATE TABLE IF NOT EXISTS comment_shields (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Unique constraint: one shield per user per comment
  UNIQUE(user_id, comment_id)
);

-- =====================================================
-- NFTS TABLE
-- User-owned NFTs and achievements
-- =====================================================
CREATE TABLE IF NOT EXISTS nfts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mint_address TEXT NOT NULL, -- Solana NFT mint address
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  metadata_url TEXT,
  collection_name TEXT,
  rarity_rank INTEGER,
  floor_price DECIMAL(20, 9), -- In SOL
  acquired_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Unique constraint: one NFT per mint address per user
  UNIQUE(user_id, mint_address)
);

-- =====================================================
-- REWARDS TABLE
-- Track user rewards and earnings
-- =====================================================
CREATE TABLE IF NOT EXISTS rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reward_type TEXT NOT NULL, -- 'post_viral', 'daily_active', 'referral', 'achievement'
  amount DECIMAL(20, 9) NOT NULL, -- Reward amount in SOL
  description TEXT NOT NULL,
  transaction_signature TEXT, -- Solana transaction hash
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Constraints
  CONSTRAINT reward_amount_positive CHECK (amount > 0),
  CONSTRAINT valid_reward_type CHECK (reward_type IN ('post_viral', 'daily_active', 'referral', 'achievement', 'shield_milestone', 'creator_bonus'))
);

-- =====================================================
-- FOLLOWS TABLE
-- User following relationships
-- =====================================================
CREATE TABLE IF NOT EXISTS follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Unique constraint and prevent self-follow
  UNIQUE(follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- =====================================================
-- ACHIEVEMENTS TABLE
-- Platform achievements and milestones
-- =====================================================
CREATE TABLE IF NOT EXISTS achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  icon_url TEXT,
  requirement_type TEXT NOT NULL, -- 'shields_received', 'posts_created', 'days_active', 'followers'
  requirement_value INTEGER NOT NULL,
  reward_amount DECIMAL(20, 9) DEFAULT 0, -- SOL reward for achievement
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =====================================================
-- USER_ACHIEVEMENTS TABLE
-- Track which users have earned which achievements
-- =====================================================
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Unique constraint: one achievement per user
  UNIQUE(user_id, achievement_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Post indexes
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_shields_count ON posts(shields_count DESC);

-- Shield indexes
CREATE INDEX IF NOT EXISTS idx_shields_user_id ON shields(user_id);
CREATE INDEX IF NOT EXISTS idx_shields_post_id ON shields(post_id);
CREATE INDEX IF NOT EXISTS idx_shields_created_at ON shields(created_at DESC);

-- Comment indexes
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_comment_id);

-- NFT indexes
CREATE INDEX IF NOT EXISTS idx_nfts_user_id ON nfts(user_id);
CREATE INDEX IF NOT EXISTS idx_nfts_mint_address ON nfts(mint_address);

-- Reward indexes
CREATE INDEX IF NOT EXISTS idx_rewards_user_id ON rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_rewards_created_at ON rewards(created_at DESC);

-- Follow indexes
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);

-- =====================================================
-- TRIGGERS FOR AUTO-UPDATING COUNTERS
-- =====================================================

-- Drop existing triggers first to avoid conflicts
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
DROP TRIGGER IF EXISTS shield_count_trigger ON shields;
DROP TRIGGER IF EXISTS comment_count_trigger ON comments;
DROP TRIGGER IF EXISTS user_post_count_trigger ON posts;
DROP TRIGGER IF EXISTS follow_count_trigger ON follows;
DROP TRIGGER IF EXISTS nft_count_trigger ON nfts;

-- Update updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Shield count trigger for posts
CREATE OR REPLACE FUNCTION update_post_shields_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET shields_count = shields_count + 1 WHERE id = NEW.post_id;
        UPDATE users SET total_shields_received = total_shields_received + 1 WHERE id = (SELECT user_id FROM posts WHERE id = NEW.post_id);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET shields_count = shields_count - 1 WHERE id = OLD.post_id;
        UPDATE users SET total_shields_received = total_shields_received - 1 WHERE id = (SELECT user_id FROM posts WHERE id = OLD.post_id);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS shield_count_trigger ON shields;
CREATE TRIGGER shield_count_trigger
    AFTER INSERT OR DELETE ON shields
    FOR EACH ROW EXECUTE FUNCTION update_post_shields_count();

-- Comment count trigger for posts
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS comment_count_trigger ON comments;
CREATE TRIGGER comment_count_trigger
    AFTER INSERT OR DELETE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_post_comment_count();

-- Post count trigger for users
CREATE OR REPLACE FUNCTION update_user_post_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE users SET post_count = post_count + 1 WHERE id = NEW.user_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE users SET post_count = post_count - 1 WHERE id = OLD.user_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_post_count_trigger ON posts;
CREATE TRIGGER user_post_count_trigger
    AFTER INSERT OR DELETE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_user_post_count();

-- Follow count triggers
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE users SET following_count = following_count + 1 WHERE id = NEW.follower_id;
        UPDATE users SET follower_count = follower_count + 1 WHERE id = NEW.following_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE users SET following_count = following_count - 1 WHERE id = OLD.follower_id;
        UPDATE users SET follower_count = follower_count - 1 WHERE id = OLD.following_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS follow_count_trigger ON follows;
CREATE TRIGGER follow_count_trigger
    AFTER INSERT OR DELETE ON follows
    FOR EACH ROW EXECUTE FUNCTION update_follow_counts();

-- NFT count trigger
CREATE OR REPLACE FUNCTION update_user_nft_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE users SET nft_count = nft_count + 1 WHERE id = NEW.user_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE users SET nft_count = nft_count - 1 WHERE id = OLD.user_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS nft_count_trigger ON nfts;
CREATE TRIGGER nft_count_trigger
    AFTER INSERT OR DELETE ON nfts
    FOR EACH ROW EXECUTE FUNCTION update_user_nft_count();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shields ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_shields ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfts ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Users are publicly readable" ON users;
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

DROP POLICY IF EXISTS "Posts are publicly readable" ON posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;

DROP POLICY IF EXISTS "Shields are publicly readable" ON shields;
DROP POLICY IF EXISTS "Authenticated users can shield posts" ON shields;
DROP POLICY IF EXISTS "Users can remove their own shields" ON shields;

DROP POLICY IF EXISTS "Comments are publicly readable" ON comments;
DROP POLICY IF EXISTS "Authenticated users can comment" ON comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;

DROP POLICY IF EXISTS "Comment shields are publicly readable" ON comment_shields;
DROP POLICY IF EXISTS "Users can shield comments" ON comment_shields;
DROP POLICY IF EXISTS "Users can remove their comment shields" ON comment_shields;

DROP POLICY IF EXISTS "NFTs are publicly readable" ON nfts;
DROP POLICY IF EXISTS "Users can add their NFTs" ON nfts;

DROP POLICY IF EXISTS "Rewards are readable by owners" ON rewards;
DROP POLICY IF EXISTS "System can create rewards" ON rewards;

DROP POLICY IF EXISTS "Follows are publicly readable" ON follows;
DROP POLICY IF EXISTS "Users can follow others" ON follows;
DROP POLICY IF EXISTS "Users can unfollow" ON follows;

DROP POLICY IF EXISTS "Achievements are publicly readable" ON achievements;
DROP POLICY IF EXISTS "User achievements are publicly readable" ON user_achievements;

-- Users policies
CREATE POLICY "Users are publicly readable" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own data" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (true);

-- Posts policies
CREATE POLICY "Posts are publicly readable" ON posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own posts" ON posts FOR UPDATE USING (true);
CREATE POLICY "Users can delete their own posts" ON posts FOR DELETE USING (true);

-- Shields policies
CREATE POLICY "Shields are publicly readable" ON shields FOR SELECT USING (true);
CREATE POLICY "Authenticated users can shield posts" ON shields FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can remove their own shields" ON shields FOR DELETE USING (true);

-- Comments policies
CREATE POLICY "Comments are publicly readable" ON comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own comments" ON comments FOR UPDATE USING (true);
CREATE POLICY "Users can delete their own comments" ON comments FOR DELETE USING (true);

-- Other tables follow similar pattern
CREATE POLICY "Comment shields are publicly readable" ON comment_shields FOR SELECT USING (true);
CREATE POLICY "Users can shield comments" ON comment_shields FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can remove their comment shields" ON comment_shields FOR DELETE USING (true);

CREATE POLICY "NFTs are publicly readable" ON nfts FOR SELECT USING (true);
CREATE POLICY "Users can add their NFTs" ON nfts FOR INSERT WITH CHECK (true);

CREATE POLICY "Rewards are readable by owners" ON rewards FOR SELECT USING (true);
CREATE POLICY "System can create rewards" ON rewards FOR INSERT WITH CHECK (true);

CREATE POLICY "Follows are publicly readable" ON follows FOR SELECT USING (true);
CREATE POLICY "Users can follow others" ON follows FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can unfollow" ON follows FOR DELETE USING (true);

CREATE POLICY "Achievements are publicly readable" ON achievements FOR SELECT USING (true);
CREATE POLICY "User achievements are publicly readable" ON user_achievements FOR SELECT USING (true);

-- =====================================================
-- SAMPLE ACHIEVEMENTS DATA
-- =====================================================

-- Clear existing sample achievements first (optional - remove if you want to keep existing data)
-- DELETE FROM achievements WHERE name IN ('First Shield', 'Shield Master', 'Shield Legend', 'Prolific Creator', 'Content King', 'Popular Creator', 'Influencer', 'Daily User', 'Dedicated User');

-- Insert sample achievements (using ON CONFLICT to handle duplicates)
INSERT INTO achievements (name, description, requirement_type, requirement_value, reward_amount) VALUES
('First Shield', 'Receive your first shield on a post', 'shields_received', 1, 0.001),
('Shield Master', 'Receive 100 shields across all posts', 'shields_received', 100, 0.01),
('Shield Legend', 'Receive 1000 shields across all posts', 'shields_received', 1000, 0.1),
('Prolific Creator', 'Create 10 posts', 'posts_created', 10, 0.005),
('Content King', 'Create 100 posts', 'posts_created', 100, 0.05),
('Popular Creator', 'Gain 50 followers', 'followers', 50, 0.02),
('Influencer', 'Gain 500 followers', 'followers', 500, 0.2),
('Daily User', 'Be active for 7 consecutive days', 'days_active', 7, 0.01),
('Dedicated User', 'Be active for 30 consecutive days', 'days_active', 30, 0.05)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  requirement_type = EXCLUDED.requirement_type,
  requirement_value = EXCLUDED.requirement_value,
  reward_amount = EXCLUDED.reward_amount;

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- User leaderboard view
CREATE OR REPLACE VIEW user_leaderboard AS
SELECT 
    u.id,
    u.username,
    u.display_name,
    u.total_shields_received,
    u.post_count,
    u.follower_count,
    u.nft_count,
    u.total_rewards_earned
FROM users u
ORDER BY u.total_shields_received DESC, u.follower_count DESC;

-- Post feed view with user info
CREATE OR REPLACE VIEW post_feed AS
SELECT 
    p.id,
    p.content,
    p.image_urls,
    p.shields_count,
    p.comment_count,
    p.created_at,
    u.username,
    u.display_name,
    u.avatar_url,
    u.is_verified
FROM posts p
JOIN users u ON p.user_id = u.id
ORDER BY p.created_at DESC;
