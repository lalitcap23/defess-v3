import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { id } = params;
    const { username } = await request.json();
    
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
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if post exists
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('*, users(username)')
      .eq('id', id)
      .single();
    
    if (postError || !post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Check if user has already liked this post
    const { data: existingShield, error: shieldCheckError } = await supabase
      .from('shields')
      .select('id')
      .eq('user_id', user.id)
      .eq('post_id', id)
      .maybeSingle();

    if (shieldCheckError) {
      console.error('Error checking existing shield:', shieldCheckError);
      return NextResponse.json(
        { error: 'Failed to check like status' },
        { status: 500 }
      );
    }

    let updatedPost;
    let isLiked = false;

    if (existingShield) {
      // User has already liked - UNLIKE (remove shield)
      const { error: deleteError } = await supabase
        .from('shields')
        .delete()
        .eq('id', existingShield.id);

      if (deleteError) {
        console.error('Error removing shield:', deleteError);
        return NextResponse.json(
          { error: 'Failed to unlike post' },
          { status: 500 }
        );
      }

      isLiked = false;
    } else {
      // User hasn't liked - LIKE (add shield)
      const { error: insertError } = await supabase
        .from('shields')
        .insert({
          user_id: user.id,
          post_id: id
        });

      if (insertError) {
        console.error('Error adding shield:', insertError);
        return NextResponse.json(
          { error: 'Failed to like post' },
          { status: 500 }
        );
      }

      isLiked = true;
    }

    // Get updated post with new shield count
    const { data: refreshedPost, error: refreshError } = await supabase
      .from('posts')
      .select('*, users(username)')
      .eq('id', id)
      .single();

    if (refreshError) {
      console.error('Error refreshing post:', refreshError);
      return NextResponse.json(
        { error: 'Failed to refresh post data' },
        { status: 500 }
      );
    }

    // Transform response to match frontend expectations
    const transformedPost = {
      _id: refreshedPost.id,
      content: refreshedPost.content,
      username: Array.isArray(refreshedPost.users) ? refreshedPost.users[0]?.username : refreshedPost.users?.username,
      likes: refreshedPost.shields_count,
      createdAt: refreshedPost.created_at,
      comments: [],
      isLiked: isLiked
    };
    
    return NextResponse.json(transformedPost);
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    );
  }
} 