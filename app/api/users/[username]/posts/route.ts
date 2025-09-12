import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  try {
    const { username } = params

    // Get user's posts with user info
    const { data: posts, error } = await supabase
      .from('post_feed')
      .select('*')
      .eq('username', username)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user posts:', error)
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
    }

    // Transform to match expected format
    const transformedPosts = (posts || []).map(post => ({
      _id: post.id,
      content: post.content,
      username: post.username,
      likes: post.shields_count,
      createdAt: post.created_at,
      comments: [] // Comments would need separate query if needed
    }))

    return NextResponse.json(transformedPosts)
  } catch (error) {
    console.error('Error in get user posts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
