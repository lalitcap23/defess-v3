import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Post from '@/lib/models/Post';

export async function GET() {
  try {
    await connectDB();
    const posts = await Post.find().sort({ createdAt: -1 });
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching posts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { content } = await request.json();
    await connectDB();
    const post = await Post.create({ content });
    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json({ error: 'Error creating post' }, { status: 500 });
  }
} 