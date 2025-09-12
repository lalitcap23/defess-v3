import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.trim().length < 2) {
      return NextResponse.json([])
    }

    // Search users by username (case insensitive partial match)
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .order('total_shields_received', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Error searching users:', error)
      return NextResponse.json({ error: 'Failed to search users' }, { status: 500 })
    }

    return NextResponse.json(users || [])
  } catch (error) {
    console.error('Error in user search:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
