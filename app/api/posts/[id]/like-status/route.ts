import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const { id } = params;

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Get user ID from username
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (userError || !user) {
      return NextResponse.json({ isLiked: false });
    }

    // Check if user has liked this post
    const { data: shield, error: shieldError } = await supabase
      .from('shields')
      .select('id')
      .eq('user_id', user.id)
      .eq('post_id', id)
      .maybeSingle();

    if (shieldError) {
      console.error('Error checking like status:', shieldError);
      return NextResponse.json({ isLiked: false });
    }

    return NextResponse.json({ isLiked: !!shield });
  } catch (error) {
    console.error('Error getting like status:', error);
    return NextResponse.json({ isLiked: false });
  }
}
