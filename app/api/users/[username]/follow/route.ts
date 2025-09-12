import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Check if user is following another user
export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const followerUsername = searchParams.get('follower')
    const { username: followingUsername } = params

    if (!followerUsername) {
      return NextResponse.json({ isFollowing: false })
    }

    // Get user IDs
    const { data: follower, error: followerError } = await supabase
      .from('users')
      .select('id')
      .eq('username', followerUsername)
      .single()

    const { data: following, error: followingError } = await supabase
      .from('users')
      .select('id')
      .eq('username', followingUsername)
      .single()

    if (followerError || followingError || !follower || !following) {
      return NextResponse.json({ isFollowing: false })
    }

    // Check if follow relationship exists
    const { data: follow, error: followError } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', follower.id)
      .eq('following_id', following.id)
      .maybeSingle()

    if (followError) {
      console.error('Error checking follow status:', followError)
      return NextResponse.json({ isFollowing: false })
    }

    return NextResponse.json({ isFollowing: !!follow })
  } catch (error) {
    console.error('Error in follow status check:', error)
    return NextResponse.json({ isFollowing: false })
  }
}

// Toggle follow/unfollow
export async function POST(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  try {
    const { follower: followerUsername } = await request.json()
    const { username: followingUsername } = params

    if (!followerUsername) {
      return NextResponse.json({ error: 'Follower username required' }, { status: 400 })
    }

    if (followerUsername === followingUsername) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 })
    }

    // Get user IDs
    const { data: follower, error: followerError } = await supabase
      .from('users')
      .select('id')
      .eq('username', followerUsername)
      .single()

    const { data: following, error: followingError } = await supabase
      .from('users')
      .select('id')
      .eq('username', followingUsername)
      .single()

    if (followerError || followingError || !follower || !following) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if already following
    const { data: existingFollow, error: checkError } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', follower.id)
      .eq('following_id', following.id)
      .maybeSingle()

    if (checkError) {
      console.error('Error checking existing follow:', checkError)
      return NextResponse.json({ error: 'Failed to check follow status' }, { status: 500 })
    }

    let isFollowing = false

    if (existingFollow) {
      // Unfollow
      const { error: deleteError } = await supabase
        .from('follows')
        .delete()
        .eq('id', existingFollow.id)

      if (deleteError) {
        console.error('Error unfollowing:', deleteError)
        return NextResponse.json({ error: 'Failed to unfollow' }, { status: 500 })
      }
      
      isFollowing = false
    } else {
      // Follow
      const { error: insertError } = await supabase
        .from('follows')
        .insert({
          follower_id: follower.id,
          following_id: following.id
        })

      if (insertError) {
        console.error('Error following:', insertError)
        return NextResponse.json({ error: 'Failed to follow' }, { status: 500 })
      }
      
      isFollowing = true
    }

    return NextResponse.json({ isFollowing })
  } catch (error) {
    console.error('Error in follow toggle:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
