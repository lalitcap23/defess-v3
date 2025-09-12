"use client"

import { useState, useEffect } from "react"
import { Layout } from "@/components/layout"
import { TweetFeed } from "@/components/tweet-feed"
import { useUser } from "@/contexts/WalletContext"
import { Search, Loader2, User, CalendarDays, MessageSquare, Heart, Users, Trophy } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"

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

interface UserProfile {
  id: string
  username: string
  display_name?: string
  bio?: string
  avatar_url?: string
  total_shields_received: number
  post_count: number
  follower_count: number
  following_count: number
  is_verified: boolean
  created_at: string
}

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<UserProfile[]>([])
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [userPosts, setUserPosts] = useState<Post[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingPosts, setIsLoadingPosts] = useState(false)
  const { user } = useUser()

  // Debounced search
  useEffect(() => {
    if (searchQuery.trim()) {
      const timeoutId = setTimeout(() => {
        searchUsers(searchQuery.trim())
      }, 300)
      return () => clearTimeout(timeoutId)
    } else {
      setSearchResults([])
      setSelectedUser(null)
      setUserPosts([])
    }
  }, [searchQuery])

  const searchUsers = async (query: string) => {
    if (query.length < 2) return

    setIsSearching(true)
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data)
      }
    } catch (error) {
      console.error('Error searching users:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const selectUser = async (userProfile: UserProfile) => {
    setSelectedUser(userProfile)
    setIsLoadingPosts(true)
    try {
      const response = await fetch(`/api/users/${userProfile.username}/posts`)
      if (response.ok) {
        const data = await response.json()
        setUserPosts(data)
      }
    } catch (error) {
      console.error('Error fetching user posts:', error)
    } finally {
      setIsLoadingPosts(false)
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
        setUserPosts(userPosts.map(post => 
          post._id === id ? { ...post, likes: updatedPost.likes } : post
        ))
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Layout>
      <div className="flex-1 border-x border-border max-w-4xl mx-auto">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="p-4">
            <h1 className="text-xl font-bold mb-4">Explore Users</h1>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users by username..."
                className="pl-10 bg-background/50"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Search Results Sidebar */}
          <div className="w-80 border-r border-border h-[calc(100vh-120px)] overflow-y-auto">
            {searchQuery.trim() ? (
              <div className="p-4">
                <h3 className="font-semibold mb-4 text-sm text-muted-foreground">
                  Search Results ({searchResults.length})
                </h3>
                <AnimatePresence>
                  {searchResults.map((userProfile, index) => (
                    <motion.div
                      key={userProfile.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => selectUser(userProfile)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                        selectedUser?.id === userProfile.id 
                          ? 'bg-primary/10 border border-primary/20' 
                          : 'hover:bg-accent/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-accent to-purple-900 flex items-center justify-center flex-shrink-0">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-1">
                            <p className="font-medium text-sm truncate">
                              {userProfile.display_name || userProfile.username}
                            </p>
                            {userProfile.is_verified && (
                              <Badge variant="secondary" className="text-xs">
                                ✓
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">@{userProfile.username}</p>
                          <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center space-x-1">
                              <MessageSquare className="h-3 w-3" />
                              <span>{userProfile.post_count}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Heart className="h-3 w-3" />
                              <span>{userProfile.total_shields_received}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {searchResults.length === 0 && !isSearching && (
                  <div className="text-center py-8 text-muted-foreground">
                    <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No users found</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Start typing to search for users</p>
              </div>
            )}
          </div>

          {/* User Profile and Posts */}
          <div className="flex-1">
            {selectedUser ? (
              <>
                {/* User Profile Header */}
                <Card className="m-4 border-border">
                  <CardHeader className="pb-3">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-accent to-purple-900 flex items-center justify-center flex-shrink-0">
                        <User className="h-8 w-8 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <CardTitle className="text-xl">
                            {selectedUser.display_name || selectedUser.username}
                          </CardTitle>
                          {selectedUser.is_verified && (
                            <Badge variant="secondary">Verified</Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground">@{selectedUser.username}</p>
                        {selectedUser.bio && (
                          <p className="mt-2 text-sm">{selectedUser.bio}</p>
                        )}
                        <div className="flex items-center space-x-1 mt-2 text-xs text-muted-foreground">
                          <CalendarDays className="h-3 w-3" />
                          <span>Joined {formatDate(selectedUser.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-primary">{selectedUser.post_count}</p>
                        <p className="text-xs text-muted-foreground">Posts</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-red-500">{selectedUser.total_shields_received}</p>
                        <p className="text-xs text-muted-foreground">Shields</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-500">{selectedUser.following_count}</p>
                        <p className="text-xs text-muted-foreground">Following</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-500">{selectedUser.follower_count}</p>
                        <p className="text-xs text-muted-foreground">Followers</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* User Posts */}
                <div className="border-t border-border">
                  <div className="p-4">
                    <h3 className="font-semibold mb-4">Posts by @{selectedUser.username}</h3>
                  </div>
                  {isLoadingPosts ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                      <span className="ml-2 text-sm text-muted-foreground">Loading posts...</span>
                    </div>
                  ) : userPosts.length > 0 ? (
                    <TweetFeed 
                      tweets={userPosts.map(post => ({
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
                      onComment={() => {}} // Placeholder for now
                    />
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No posts yet</p>
                      <p>@{selectedUser.username} hasn't posted anything yet.</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-xl font-medium mb-2">Discover Users</p>
                  <p>Search for users to view their profiles and posts</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
