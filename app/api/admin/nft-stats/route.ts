import { NextResponse } from 'next/server';
import { WinnerSelectionService } from '@/lib/services/winner-selection';
import { PeriodProcessor } from '@/lib/jobs/period-processor';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('Fetching NFT system statistics...');

    const winnerService = new WinnerSelectionService();
    const processor = new PeriodProcessor();
    
    // Get recent winners
    const recentWinners = await winnerService.getRecentWinners(10);
    
    // Get basic database stats
    const { data: totalPosts, count: postsCount } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true });
      
    const { data: totalUsers, count: usersCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    const { data: totalWinners, count: winnersCount } = await supabase
      .from('nft_winners')
      .select('*', { count: 'exact', head: true });
      
    const { data: postsLast24h, count: posts24hCount } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    // Calculate current period info
    const now = Date.now();
    const thirtyMinutesMs = 30 * 60 * 1000;
    const currentPeriodStart = Math.floor(now / thirtyMinutesMs) * thirtyMinutesMs;
    const currentPeriodEnd = currentPeriodStart + thirtyMinutesMs;
    const minutesUntilNext = Math.ceil((currentPeriodEnd - now) / (60 * 1000));

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      
      // System overview
      overview: {
        totalWinners: winnersCount || 0,
        totalPosts: postsCount || 0,
        totalUsers: usersCount || 0,
        postsLast24h: posts24hCount || 0,
        minutesUntilNextProcessing: minutesUntilNext
      },

      // Current period info
      currentPeriod: {
        start: new Date(currentPeriodStart).toISOString(),
        end: new Date(currentPeriodEnd).toISOString(),
        minutesRemaining: minutesUntilNext
      },

      // Recent winners
      recentWinners: recentWinners.map(winner => ({
        period_timestamp: winner.period_timestamp,
        like_count: winner.like_count,
        selected_at: winner.selected_at,
        mint_status: winner.mint_status,
        transaction_signature: winner.transaction_signature
      })),

      // Configuration status
      config: {
        cronSecretConfigured: !!process.env.CRON_SECRET,
        solanaConfigured: !!process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    });

  } catch (error) {
    console.error('Stats endpoint error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch statistics',
      message: (error as Error).message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// POST endpoint for manual operations (admin only)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    // TODO: Add admin authentication here
    
    switch (action) {
      case 'process_period':
        const processor = new PeriodProcessor();
        const result = await processor.processPreviousPeriod();
        return NextResponse.json({ action, result });

      case 'test_winner_selection':
        const winnerService = new WinnerSelectionService();
        const winner = await winnerService.findPreviousPeriodWinner();
        return NextResponse.json({ 
          action, 
          winner: winner ? {
            username: winner.username,
            likeCount: winner.likeCount,
            hasWallet: !!winner.userWalletAddress
          } : null 
        });

      default:
        return NextResponse.json({ 
          error: 'Invalid action',
          availableActions: ['process_period', 'test_winner_selection']
        }, { status: 400 });
    }

  } catch (error) {
    return NextResponse.json({ 
      error: 'Admin operation failed',
      message: (error as Error).message
    }, { status: 500 });
  }
}