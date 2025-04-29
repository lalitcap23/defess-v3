import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Post from '@/lib/models/Post';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const post = await Post.findById(params.id);
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    post.likes += 1;
    await post.save();
    
    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json({ error: 'Error liking post' }, { status: 500 });
  }
} 