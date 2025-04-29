"use client"

import { useState, useEffect } from "react"
import { Layout } from "@/components/layout"
import { TweetFeed } from "@/components/tweet-feed"
import { ComposeTweet } from "@/components/compose-tweet"
import { Login } from "@/components/login"

interface Comment {
  id: string
  content: string
  username: string
  timestamp: string
}

interface Post {
  _id: string
  content: string
  username: string
  likes: number
  createdAt: string
  comments?: Comment[]
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [username, setUsername] = useState<string | null>(null)

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
    if (!username) return

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, username }),
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

  const handleComment = async (postId: string, content: string) => {
    if (!username) return

    try {
      const response = await fetch(`/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, username }),
      })
      const updatedPost = await response.json()
      setPosts(posts.map(post => 
        post._id === postId ? updatedPost : post
      ))
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  const handleLogin = (username: string) => {
    setUsername(username)
  }

  return (
    <Layout>
      <div className="flex-1 border-x border-border max-w-2xl">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
          <h1 className="text-xl font-bold p-4">Home</h1>
        </div>
        {!username ? (
          <Login onLogin={handleLogin} />
        ) : (
          <>
            <div className="p-4 border-b border-border">
              <p className="text-sm text-muted-foreground">Logged in as: <span className="font-medium text-foreground">{username}</span></p>
            </div>
            <ComposeTweet onTweet={handleAddPost} />
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">Loading posts...</div>
            ) : (
              <TweetFeed 
                tweets={posts.map(post => ({
                  id: post._id,
                  content: post.content,
                  username: post.username,
                  likes: post.likes,
                  timestamp: new Date(post.createdAt),
                  comments: post.comments
                }))} 
                onLike={handleLikePost}
                onComment={handleComment}
              />
            )}
          </>
        )}
      </div>
    </Layout>
  )
}