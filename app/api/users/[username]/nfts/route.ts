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

    // Get user's NFTs
    const { data: nfts, error } = await supabase
      .from('nfts')
      .select(`
        *,
        users!inner(username)
      `)
      .eq('users.username', username)
      .order('acquired_at', { ascending: false })

    if (error) {
      console.error('Error fetching user NFTs:', error)
      return NextResponse.json({ error: 'Failed to fetch NFTs' }, { status: 500 })
    }

    return NextResponse.json(nfts || [])
  } catch (error) {
    console.error('Error in get user NFTs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
