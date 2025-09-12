"use client"

import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import { Trophy, User, Heart, Share, MessageCircle, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { motion, AnimatePresence } from "framer-motion"
import { useWallet } from "@/contexts/WalletContext"

interface Comment {
  id: string
  content: string
  username: string
  timestamp: Date
}

interface TweetProps {
  tweet: {
    id: string
    content: string
    username: string
    likes: number
    timestamp: Date
    comments?: Comment[]
  }
  onLike: () => void
  onComment?: (tweetId: string, comment: string) => void
}

export function Tweet({ tweet, onLike, onComment }: TweetProps) {
  const [isCommenting, setIsCommenting] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(tweet.likes)
  const { username } = useWallet()
  const timeAgo = formatDistanceToNow(new Date(tweet.timestamp), { addSuffix: true })

  // Check if current user has liked this post
  useEffect(() => {
    if (username) {
      fetch(`/api/posts/${tweet.id}/like-status?username=${username}`)
        .then(res => res.json())
        .then(data => setIsLiked(data.isLiked))
        .catch(err => console.error('Error checking like status:', err))
    }
  }, [tweet.id, username])

  const handleLike = async () => {
    if (!username) {
      alert('Please connect your wallet first!')
      return
    }

    try {
      const response = await fetch(`/api/posts/${tweet.id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      })

      if (response.ok) {
        const updatedPost = await response.json()
        setLikeCount(updatedPost.likes)
        setIsLiked(updatedPost.isLiked)
        onLike() // Call parent callback to refresh feed if needed
      } else {
        console.error('Failed to toggle like')
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const handleComment = () => {
    if (commentText.trim() && onComment) {
      onComment(tweet.id, commentText)
      setCommentText("")
    }
  }

  return (
    <motion.div
      whileHover={{ backgroundColor: "rgba(var(--accent), 0.1)" }}
      className="border-b border-border/50 p-4 transition-colors"
    >
      <div className="flex">
        <div className="mr-4">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-12 h-12 rounded-full bg-gradient-to-r from-accent to-purple-900 flex items-center justify-center"
          >
            <User className="h-6 w-6 text-primary" />
          </motion.div>
        </div>
        <div className="flex-1">
          <div className="flex items-center">
            <span className="font-bold text-sm">{tweet.username}</span>
            <span className="text-muted-foreground text-sm ml-2">@{tweet.username} · {timeAgo}</span>
          </div>

          <div className="mt-2 text-[15px] leading-relaxed">{tweet.content}</div>

          <div className="flex justify-start mt-4 gap-6">
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-full group transition-all ${
                isLiked 
                  ? 'text-red-500 hover:text-red-600 hover:bg-red-400/10' 
                  : 'hover:text-red-400 hover:bg-red-400/10'
              }`}
              onClick={handleLike}
            >
              <Heart 
                className={`h-4 w-4 mr-2 group-hover:scale-110 transition-transform ${
                  isLiked ? 'fill-current' : ''
                }`} 
              />
              <span className="text-xs">{likeCount}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full hover:text-blue-400 hover:bg-blue-400/10 group"
              onClick={() => setIsCommenting(!isCommenting)}
            >
              <MessageCircle className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs">{tweet.comments?.length || 0}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full hover:text-green-400 hover:bg-green-400/10 group"
            >
              <Share className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
            </Button>
          </div>

          <AnimatePresence>
            {isCommenting && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <div className="flex gap-2">
                  <Textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className="min-h-[40px] resize-none bg-accent/50 border-accent"
                  />
                  <Button
                    onClick={handleComment}
                    disabled={!commentText.trim()}
                    size="icon"
                    className="rounded-full bg-accent hover:bg-accent/80"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {tweet.comments && tweet.comments.length > 0 && (
            <motion.div className="mt-4 space-y-3">
              {tweet.comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="pl-4 border-l-2 border-accent"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                      <User className="h-3 w-3" />
                    </div>
                    <span className="text-sm font-medium">{comment.username}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{comment.content}</p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}