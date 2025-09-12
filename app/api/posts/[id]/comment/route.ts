import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { id } = params;
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

    // Verify post exists
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id')
      .eq('id', id)
      .single();
    
    if (postError || !post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    // Create the comment
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .insert({
        content,
        user_id: user.id,
        post_id: id
      })
      .select('*')
      .single();

    if (commentError) {
      console.error('Error creating comment:', commentError);
      return NextResponse.json(
        { error: 'Failed to add comment' },
        { status: 500 }
      );
    }

    // Get the updated post with comments
    const { data: updatedPost, error: fetchError } = await supabase
      .from('posts')
      .select(`
        *,
        users(username),
        comments(
          id,
          content,
          created_at,
          users(username)
        )
      `)
      .eq('id', id)
      .single();
    
    if (fetchError) {
      console.error('Error fetching updated post:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch updated post' },
        { status: 500 }
      );
    }

    // Transform response to match frontend expectations
    const transformedPost = {
      _id: updatedPost.id,
      content: updatedPost.content,
      username: Array.isArray(updatedPost.users) ? updatedPost.users[0]?.username : updatedPost.users?.username,
      likes: updatedPost.shields_count,
      createdAt: updatedPost.created_at,
      comments: updatedPost.comments?.map((c: any) => ({
        id: c.id,
        content: c.content,
        username: Array.isArray(c.users) ? c.users[0]?.username : c.users?.username,
        timestamp: c.created_at
      })) || []
    };
    
    return NextResponse.json(transformedPost);
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}