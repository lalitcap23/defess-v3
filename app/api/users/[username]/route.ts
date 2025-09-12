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

    // Get user profile
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      console.error('Error fetching user profile:', error)
      return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error in get user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
