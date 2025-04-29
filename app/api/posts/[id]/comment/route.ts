import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Post from '@/lib/models/Post';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { content, username } = await request.json();
    
    if (!content || !username) {
      return NextResponse.json(
        { error: 'Content and username are required' },
        { status: 400 }
      );
    }

    await connectDB();
    
    const post = await Post.findById(id);
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    post.comments.push({
      content,
      username,
      createdAt: new Date()
    });
    
    await post.save();
    
    return NextResponse.json(post);
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}