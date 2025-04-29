import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Post from '@/lib/models/Post';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    await connectDB();
    
    const post = await Post.findById(id);
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    // Simply increment the like count
    post.likes += 1;
    
    await post.save();
    
    return NextResponse.json(post);
  } catch (error) {
    console.error('Error liking post:', error);
    return NextResponse.json(
      { error: 'Failed to like post' },
      { status: 500 }
    );
  }
} 