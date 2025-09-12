"use client"

import { useState, useEffect } from "react"
import { Layout } from "@/components/layout"
import { TweetFeed } from "@/components/tweet-feed"
import { ComposeTweet } from "@/components/compose-tweet"
import SolanaConnectButton from "@/components/solana-connect-button"
import { useUser } from "@/contexts/WalletContext"
import { Loader2 } from "lucide-react"

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
  const { user, isLoading: userLoading } = useUser()

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
    if (!user) return

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, username: user.username }),
      })
      const newPost = await response.json()
      setPosts([newPost, ...posts])
    } catch (error) {
      console.error('Error creating post:', error)
    }
  }

  const handleLikePost = async (id: string) => {
    if (!user) return

    try {
      const response = await fetch(`/api/posts/${id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: user.username }),
      })
      
      if (response.ok) {
        const updatedPost = await response.json()
        setPosts(posts.map(post => 
          post._id === id ? { ...post, likes: updatedPost.likes } : post
        ))
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const handleComment = async (postId: string, content: string) => {
    if (!user) return

    try {
      const response = await fetch(`/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, username: user.username }),
      })
      const updatedPost = await response.json()
      setPosts(posts.map(post => 
        post._id === postId ? updatedPost : post
      ))
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  if (userLoading) {
    return (
      <Layout>
        <div className="flex-1 border-x border-border max-w-2xl">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
            <span className="ml-2 text-sm text-gray-600">Loading...</span>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="flex-1 border-x border-border max-w-2xl">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
          <h1 className="text-xl font-bold p-4">Defess v3</h1>
        </div>
        
        {/* Wallet Connection Section */}
        <div className="p-4 border-b border-border">
          <SolanaConnectButton />
        </div>

        {!user ? (
          <div className="p-8 text-center">
            <h2 className="text-lg font-semibold mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-4">
              Connect your Solana wallet and choose a username to start posting on Defess
            </p>
          </div>
        ) : (
          <>
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
                  comments: post.comments?.map(comment => ({
                    ...comment,
                    timestamp: new Date(comment.timestamp)
                  }))
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