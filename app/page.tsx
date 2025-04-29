"use client"

import { useState, useEffect } from "react"
import { Layout } from "@/components/layout"
import { TweetFeed } from "@/components/tweet-feed"
import { ComposeTweet } from "@/components/compose-tweet"

interface Post {
  _id: string
  content: string
  likes: number
  createdAt: string
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts')
      const data = await response.json()
      setPosts(data)
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddPost = async (content: string) => {
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      })
      const newPost = await response.json()
      setPosts([newPost, ...posts])
    } catch (error) {
      console.error('Error creating post:', error)
    }
  }

  const handleLikePost = async (id: string) => {
    try {
      const response = await fetch(`/api/posts/${id}/like`, {
        method: 'POST',
      })
      const updatedPost = await response.json()
      setPosts(posts.map(post => 
        post._id === id ? updatedPost : post
      ))
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  return (
    <Layout>
      <div className="flex-1 border-x border-border max-w-2xl">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
          <h1 className="text-xl font-bold p-4">Home</h1>
        </div>
        <ComposeTweet onTweet={handleAddPost} />
        {isLoading ? (
          <div className="p-4 text-center">Loading posts...</div>
        ) : (
          <TweetFeed 
            tweets={posts.map(post => ({
              id: post._id,
              content: post.content,
              likes: post.likes,
              timestamp: new Date(post.createdAt)
            }))} 
            onLike={handleLikePost} 
          />
        )}
      </div>
    </Layout>
  )
}
