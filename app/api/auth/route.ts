import { NextResponse } from 'next/server'

// In a real application, you would use a database
// This is just for demonstration
let users: { [key: string]: string } = {}

export async function POST(request: Request) {
  try {
    const { username } = await request.json()
    
    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    // Store the username
    users[username] = username

    return NextResponse.json({ username })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ users: Object.keys(users) })
} 