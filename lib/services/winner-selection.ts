import { supabase } from '../supabase';
import { SolanaClient } from '../solana/client';

export interface WinnerData {
  postId: string;
  userId: string;
  username: string;
  likeCount: number;
  periodStartMs: number;
  userWalletAddress?: string;
}

export interface PostWithLikes {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  users: any; // Simplified to handle Supabase response variations
  like_count?: number;
}

export class WinnerSelectionService {
  private solanaClient: SolanaClient;

  constructor() {
    this.solanaClient = new SolanaClient();
  }

  /**
   * Find the most liked post in the previous 30-minute period
   */
  async findPreviousPeriodWinner(): Promise<WinnerData | null> {
    try {
      // Calculate previous period (30 minutes ago)
      const now = Date.now();
      const thirtyMinutesMs = 30 * 60 * 1000;
      const periodStartMs = Math.floor(now / thirtyMinutesMs) * thirtyMinutesMs - thirtyMinutesMs;
      const periodEndMs = periodStartMs + thirtyMinutesMs;
      
      const periodStart = new Date(periodStartMs);
      const periodEnd = new Date(periodEndMs);
      
      console.log(`🔍 Finding winner for period: ${periodStart.toISOString()} - ${periodEnd.toISOString()}`);

      // Query posts created in this period
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          user_id,
          content,
          created_at,
          users (
            username,
            wallet_address
          )
        `)
        .gte('created_at', periodStart.toISOString())
        .lt('created_at', periodEnd.toISOString())
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('❌ Error querying posts:', postsError);
        throw new Error(`Database query failed: ${postsError.message}`);
      }

      if (!posts || posts.length === 0) {
        console.log('📭 No posts found in this period');
        return null;
      }

      console.log(`📝 Found ${posts.length} posts in period`);

      // Count likes for each post and find the winner
      let maxLikes = 0;
      let winningPost: PostWithLikes | null = null;

      for (const post of posts) {
        // Count likes for this post
        const { count: likeCount, error: likesError } = await supabase
          .from('likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);

        if (likesError) {
          console.error(`❌ Error counting likes for post ${post.id}:`, likesError);
          continue;
        }

        const likes = likeCount || 0;
        const userData = Array.isArray(post.users) ? post.users[0] : post.users;
        const username = userData?.username || 'unknown';
        console.log(`📊 Post by ${username}: ${likes} likes`);

        if (likes > maxLikes) {
          maxLikes = likes;
          winningPost = { ...post, like_count: likes };
        }
      }

      if (!winningPost || maxLikes === 0 || !winningPost.users) {
        console.log('📭 No posts with likes found in this period');
        return null;
      }

      const userData = Array.isArray(winningPost.users) ? winningPost.users[0] : winningPost.users;
      const winner: WinnerData = {
        postId: winningPost.id,
        userId: winningPost.user_id,
        username: userData?.username || 'unknown',
        likeCount: maxLikes,
        periodStartMs,
        userWalletAddress: userData?.wallet_address
      };

      console.log(`Winner found: ${winner.username} with ${winner.likeCount} likes`);
      
      return winner;

    } catch (error) {
      console.error('💥 Error in findPreviousPeriodWinner:', error);
      throw error;
    }
  }

  /**
   * Process winner by calling Solana program (replaces complex Web2 validation)
   */
  async processWinner(winner: WinnerData): Promise<{ success: boolean; signature?: string; error?: string }> {
    try {
      console.log(`🚀 Processing winner on Solana: ${winner.username} with ${winner.likeCount} likes`);

      // Basic validation before calling Solana
      if (!winner.userWalletAddress) {
        return { success: false, error: 'User has no wallet address' };
      }

      if (winner.likeCount < 1) {
        return { success: false, error: 'Not enough likes (minimum 1)' };
      }

      // Call Solana program to select winner and mint NFT
      // The Solana program will handle all validation (duplicates, cooldowns, etc.)
      try {
        const signature = await this.solanaClient.selectPeriodWinner(
          Math.floor(winner.periodStartMs / 1000), // Convert to seconds
          winner.username,
          winner.postId,
          winner.likeCount
        );

        // Record winner in database for tracking
        await this.recordWinner(winner, signature);
        
        console.log(`✅ Winner processed successfully: ${signature}`);
        return { success: true, signature };
      } catch (solanaError) {
        const errorMessage = solanaError instanceof Error ? solanaError.message : 'Solana program error';
        console.log(`❌ Solana program rejected winner: ${errorMessage}`);
        return { success: false, error: errorMessage };
      }

    } catch (error) {
      console.error('❌ Error processing winner:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Record winner in database for tracking (simplified)
   */
  private async recordWinner(winner: WinnerData, transactionSignature: string): Promise<void> {
    try {
      console.log(`💾 Recording winner in database: ${winner.username}`);

      // Insert into nft_winners table
      const { error: winnerError } = await supabase
        .from('nft_winners')
        .insert({
          period_timestamp: Math.floor(winner.periodStartMs / 1000),
          post_id: winner.postId,
          user_id: winner.userId,
          like_count: winner.likeCount,
          selected_at: new Date().toISOString(),
          mint_status: 'minted', // Since Solana transaction succeeded
          transaction_signature: transactionSignature
        });

      if (winnerError) {
        console.error('❌ Error recording winner:', winnerError);
        throw new Error(`Failed to record winner: ${winnerError.message}`);
      }

      // Update the winning post to mark it as an NFT winner
      const { error: postError } = await supabase
        .from('posts')
        .update({
          is_nft_winner: true,
          winner_period_start: new Date(winner.periodStartMs).toISOString()
        })
        .eq('id', winner.postId);

      if (postError) {
        console.error('❌ Error updating winning post:', postError);
        // Don't throw here - winner is recorded, post update is secondary
      }

      console.log('✅ Winner recorded successfully');

    } catch (error) {
      console.error('💥 Error in recordWinner:', error);
      throw error;
    }
  }

  /**
   * Get winner statistics for admin dashboard
   */
  static async getWinnerStats(): Promise<{
    totalWinners: number;
    pendingMints: number;
    mintedNFTs: number;
    failedMints: number;
    last24Hours: number;
  }> {
    const { data: stats } = await supabase
      .from('nft_winners')
      .select('mint_status, selected_at');

    if (!stats) return {
      totalWinners: 0,
      pendingMints: 0,
      mintedNFTs: 0,
      failedMints: 0,
      last24Hours: 0
    };

    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    return {
      totalWinners: stats.length,
      pendingMints: stats.filter(w => w.mint_status === 'pending').length,
      mintedNFTs: stats.filter(w => w.mint_status === 'minted').length,
      failedMints: stats.filter(w => w.mint_status === 'failed').length,
      last24Hours: stats.filter(w => new Date(w.selected_at) > yesterday).length
    };
  }

  /**
   * Get recent winners for display
   */
  async getRecentWinners(limit: number = 10): Promise<any[]> {
    const { data: winners, error } = await supabase
      .from('nft_winners')
      .select(`
        period_timestamp,
        like_count,
        selected_at,
        mint_status,
        transaction_signature,
        user_id,
        post_id
      `)
      .order('selected_at', { ascending: false })
      .limit(limit);

    if (error || !winners) {
      console.error('Error fetching recent winners:', error);
      return [];
    }

    return winners.map(w => ({
      period_timestamp: w.period_timestamp,
      like_count: w.like_count,
      selected_at: w.selected_at,
      mint_status: w.mint_status,
      transaction_signature: w.transaction_signature,
      user_id: w.user_id,
      post_id: w.post_id
    }));
  }
}