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

    const samplePosts = [
      { username: 'alice_crypto', content: 'Just discovered this amazing DeFi protocol! The yields are incredible 🚀' },
      { username: 'alice_crypto', content: 'GM everyone! Another day of building in the crypto space ☀️' },
      { username: 'alice_crypto', content: 'The future of finance is decentralized. No doubt about it.' },
      
      { username: 'bob_trader', content: 'That SOL pump was insane! Anyone else catch that move? 📈' },
      { username: 'bob_trader', content: 'Pro tip: Always DYOR before investing. Never financial advice!' },
      
      { username: 'charlie_dev', content: 'Working on a new Solana dApp. The developer experience keeps getting better!' },
      { username: 'charlie_dev', content: 'Smart contracts are poetry written in code 💻' },
      { username: 'charlie_dev', content: 'Web3 is not just about money, it\'s about freedom and ownership' },
      
      { username: 'diana_nft', content: 'New NFT collection dropping this weekend! 🎨 Stay tuned for updates' },
      { username: 'diana_nft', content: 'Art should be accessible to everyone. That\'s why I love NFTs!' },
      { username: 'diana_nft', content: 'The intersection of art and technology fascinates me every day' },
    ]

    const results = []
    for (const post of samplePosts) {
      const user = users.find(u => u.username === post.username)
      if (user) {
        const { data, error } = await supabase
          .from('posts')
          .insert({
            user_id: user.id,
            content: post.content,
            shields_count: Math.floor(Math.random() * 50), // Random likes
          })
          .select()
          .single()

        if (error) {
          console.error(`Error creating post for ${post.username}:`, error)
        } else {
          results.push(data)
        }
      }
    }

    return NextResponse.json({ 
      message: `Created ${results.length} sample posts`,
      posts: results 
    })
  } catch (error) {
    console.error('Error creating sample posts:', error)
    return NextResponse.json({ error: 'Failed to create sample posts' }, { status: 500 })
  }
}
