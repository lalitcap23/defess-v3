import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET() {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { data: posts, error } = await supabase
      .from('post_feed')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      return NextResponse.json({ error: 'Error fetching posts' }, { status: 500 });
    }

    // Transform posts to match frontend expectations
    const transformedPosts = posts?.map(post => ({
      _id: post.id,
      content: post.content,
      username: post.username,
      likes: post.shields_count,
      createdAt: post.created_at,
      comments: []
    })) || [];

    return NextResponse.json(transformedPosts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Error fetching posts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { content, username } = await request.json();
    
    if (!content || !username) {
      return NextResponse.json(
        { error: 'Content and username are required' },
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

    // Create the post
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        content,
        user_id: user.id
      })
      .select('*')
      .single();

    if (postError) {
      console.error('Error creating post:', postError);
      return NextResponse.json(
        { error: 'Failed to create post' },
        { status: 500 }
      );
    }

    // Transform the response to match frontend expectations
    const transformedPost = {
      _id: post.id,
      content: post.content,
      username: username,
      likes: post.shields_count,
      createdAt: post.created_at,
      comments: []
    };
    
    return NextResponse.json(transformedPost);
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
} 