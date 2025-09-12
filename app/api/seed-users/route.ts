import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  try {
    // Sample users for testing
    const sampleUsers = [
      {
        wallet_address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
        username: 'alice_crypto',
        display_name: 'Alice Thompson',
        bio: 'Crypto enthusiast and blockchain developer. Building the future of DeFi!',
        total_shields_received: 156,
        post_count: 23
      },
      {
        wallet_address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        username: 'bob_trader',
        display_name: 'Bob Rodriguez',
        bio: 'Day trader | NFT collector | Solana maximalist 🚀',
        total_shields_received: 89,
        post_count: 15
      },
      {
        wallet_address: '5dSHdqZjuuHdqs3YMuuWdAF7gnhvhGJfHdgaX3r5YjVK',
        username: 'charlie_dev',
        display_name: 'Charlie Chen',
        bio: 'Full-stack developer working on Web3 projects',
        total_shields_received: 234,
        post_count: 45
      },
      {
        wallet_address: '8VnSNLFwqp8GB8Bp4ymzYPBj4st2rzc2FjdvsuHPAuDn',
        username: 'diana_nft',
        display_name: 'Diana Walsh',
        bio: 'NFT artist and creator. Check out my latest drops!',
        total_shields_received: 312,
        post_count: 67
      }
    ]

    // Insert sample users (only if they don't exist)
    const results = []
    for (const user of sampleUsers) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', user.username)
        .single()

      if (!existingUser) {
        const { data, error } = await supabase
          .from('users')
          .insert(user)
          .select()
          .single()

        if (error) {
          console.error(`Error creating user ${user.username}:`, error)
        } else {
          results.push(data)
        }
      }
    }

    return NextResponse.json({ 
      message: `Created ${results.length} sample users`,
      users: results 
    })
  } catch (error) {
    console.error('Error creating sample users:', error)
    return NextResponse.json({ error: 'Failed to create sample users' }, { status: 500 })
  }
}
