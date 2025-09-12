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

    const sampleNFTs = [
      {
        username: 'alice_crypto',
        mint_address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgABC',
        name: 'Degenerate Ape #1234',
        description: 'A rare degenerate ape from the famous collection',
        collection_name: 'Degenerate Apes',
        rarity_rank: 567,
        floor_price: 15.5
      },
      {
        username: 'alice_crypto',
        mint_address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtDEF',
        name: 'Solana Monkey #8901',
        description: 'Classic monkey business on Solana',
        collection_name: 'Solana Monkey Business',
        rarity_rank: 1234,
        floor_price: 8.2
      },
      {
        username: 'bob_trader',
        mint_address: '5dSHdqZjuuHdqs3YMuuWdAF7gnhvhGJfHdgaX3r5GHI',
        name: 'Magic Eden #4567',
        description: 'Official Magic Eden NFT',
        collection_name: 'Magic Eden',
        rarity_rank: 23,
        floor_price: 125.0
      },
      {
        username: 'diana_nft',
        mint_address: '8VnSNLFwqp8GB8Bp4ymzYPBj4st2rzc2FjdvsuHPJKL',
        name: 'Art Block #789',
        description: 'Generative art piece',
        collection_name: 'Diana\'s Art Collection',
        rarity_rank: 5,
        floor_price: 50.3
      },
      {
        username: 'diana_nft',
        mint_address: '6TnGNkFwqp8GB8Bp4ymzYPBj4st2rzc2FjdvsuHPMNO',
        name: 'Custom Creation #001',
        description: 'My first custom NFT creation',
        collection_name: 'Diana\'s Art Collection',
        rarity_rank: 1,
        floor_price: 200.0
      },
      {
        username: 'charlie_dev',
        mint_address: '3KmELFwqp8GB8Bp4ymzYPBj4st2rzc2FjdvsuHPPQR',
        name: 'Dev Badge #2023',
        description: 'Exclusive developer badge',
        collection_name: 'Developer Badges',
        rarity_rank: 42,
        floor_price: 5.0
      }
    ]

    const results = []
    for (const nft of sampleNFTs) {
      const user = users.find(u => u.username === nft.username)
      if (user) {
        const { data, error } = await supabase
          .from('nfts')
          .insert({
            user_id: user.id,
            mint_address: nft.mint_address,
            name: nft.name,
            description: nft.description,
            collection_name: nft.collection_name,
            rarity_rank: nft.rarity_rank,
            floor_price: nft.floor_price,
          })
          .select()
          .single()

        if (error) {
          console.error(`Error creating NFT for ${nft.username}:`, error)
        } else {
          results.push(data)
        }
      }
    }

    return NextResponse.json({ 
      message: `Created ${results.length} sample NFTs`,
      nfts: results 
    })
  } catch (error) {
    console.error('Error creating sample NFTs:', error)
    return NextResponse.json({ error: 'Failed to create sample NFTs' }, { status: 500 })
  }
}
