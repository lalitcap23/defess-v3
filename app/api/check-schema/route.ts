import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  }

  try {
    // Check what tables exist
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name')

    if (tablesError) {
      return NextResponse.json({ error: 'Error checking tables', details: tablesError }, { status: 500 })
    }

    // Check what columns exist in users table
    const { data: userColumns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'users')
      .eq('table_schema', 'public')
      .order('ordinal_position')

    return NextResponse.json({ 
      tables: tables?.map(t => t.table_name) || [],
      userColumns: userColumns || [],
      status: 'success'
    })

  } catch (error) {
    return NextResponse.json({ error: 'Database check failed', details: error }, { status: 500 })
  }
}
