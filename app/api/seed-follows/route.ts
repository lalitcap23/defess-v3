import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  try {
    // Get existing users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username')

    if (usersError || !users || users.length === 0) {
      return NextResponse.json({ error: 'No users found. Create users first.' }, { status: 400 })
    }

    // Create a map of username to id for easy lookup
    const userMap = new Map(users.map(u => [u.username, u.id]))

    const sampleFollows = [
      { follower: 'alice_crypto', following: 'diana_nft' },  // Alice follows Diana
      { follower: 'alice_crypto', following: 'charlie_dev' }, // Alice follows Charlie
      { follower: 'bob_trader', following: 'diana_nft' },    // Bob follows Diana
      { follower: 'bob_trader', following: 'alice_crypto' }, // Bob follows Alice
      { follower: 'charlie_dev', following: 'alice_crypto' }, // Charlie follows Alice
      { follower: 'diana_nft', following: 'charlie_dev' },   // Diana follows Charlie
    ]

    const results = []
    for (const follow of sampleFollows) {
      const followerId = userMap.get(follow.follower)
      const followingId = userMap.get(follow.following)
      
      if (followerId && followingId) {
        const { data, error } = await supabase
          .from('follows')
          .insert({
            follower_id: followerId,
            following_id: followingId,
          })
          .select()
          .single()

        if (error) {
          console.error(`Error creating follow relationship ${follow.follower} -> ${follow.following}:`, error)
        } else {
          results.push({
            follower: follow.follower,
            following: follow.following,
            ...data
          })
        }
      }
    }

    return NextResponse.json({ 
      message: `Created ${results.length} follow relationships`,
      follows: results 
    })
  } catch (error) {
    console.error('Error creating follow relationships:', error)
    return NextResponse.json({ error: 'Failed to create follow relationships' }, { status: 500 })
  }
}
