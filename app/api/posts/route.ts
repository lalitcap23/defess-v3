import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Post from '@/lib/models/Post';

export async function GET() {
  try {
    await connectDB();
    const posts = await Post.find().sort({ createdAt: -1 });
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Error fetching posts' }, { status: 500 });
  }
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

    await connectDB();
    
    const post = await Post.create({
      content,
      username,
      likes: 0,
      likedBy: []
    });
    
    return NextResponse.json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
} 