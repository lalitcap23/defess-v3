import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Post from '@/lib/models/Post';

// In a real application, you would use a database
let posts: any[] = [];

export async function GET() {
  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  try {
    const { content, username } = await request.json();
    
    if (!content || !username) {
      return NextResponse.json(
        { error: 'Content and username are required' },
        { status: 400 }
      );
    }

    const newPost = {
      _id: Date.now().toString(),
      content,
      username,
      likes: 0,
      createdAt: new Date().toISOString()
    };

    posts.unshift(newPost);
    return NextResponse.json(newPost);
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
} 