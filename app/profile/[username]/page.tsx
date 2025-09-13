"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Layout } from "@/components/layout"
import { TweetFeed } from "@/components/tweet-feed"
import { useUser } from "@/contexts/WalletContext"
import { ArrowLeft, CalendarDays, MessageSquare, Heart, Users, Trophy, Star, ExternalLink, UserPlus, UserMinus, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

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

interface NFT {
  id: string
  mint_address: string
  name: string
  description?: string
  image_url?: string
  collection_name?: string
  rarity_rank?: number
  floor_price?: number
  acquired_at: string
}

interface UserProfile {
  id: string
  username: string
  wallet_address: string
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

export default function ProfilePage() {
  const params = useParams()
  const username = params.username as string
  const [profileUser, setProfileUser] = useState<UserProfile | null>(null)
  const [userPosts, setUserPosts] = useState<Post[]>([])
  const [userNFTs, setUserNFTs] = useState<NFT[]>([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [isLoadingPosts, setIsLoadingPosts] = useState(true)
  const [isLoadingNFTs, setIsLoadingNFTs] = useState(true)
  const [isFollowLoading, setIsFollowLoading] = useState(false)
  const { user } = useUser()

  useEffect(() => {
    if (username) {
      fetchUserProfile(username)
      fetchUserPosts(username)
      fetchUserNFTs(username)
      if (user) {
        checkFollowStatus(username)
      }
    }
  }, [username, user])

  // Reset isFollowing state when navigating to a different profile
  useEffect(() => {
    setIsFollowing(false)
  }, [username])

  const fetchUserProfile = async (username: string) => {
    setIsLoadingProfile(true)
    try {
      const response = await fetch(`/api/users/${username}`)
      if (response.ok) {
        const data = await response.json()
        setProfileUser(data)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    } finally {
      setIsLoadingProfile(false)
    }
  }

  const fetchUserPosts = async (username: string) => {
    setIsLoadingPosts(true)
    try {
      const response = await fetch(`/api/users/${username}/posts`)
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

  const fetchUserNFTs = async (username: string) => {
    setIsLoadingNFTs(true)
    try {
      const response = await fetch(`/api/users/${username}/nfts`)
      if (response.ok) {
        const data = await response.json()
        setUserNFTs(data)
      }
    } catch (error) {
      console.error('Error fetching user NFTs:', error)
    } finally {
      setIsLoadingNFTs(false)
    }
  }

  const checkFollowStatus = async (username: string) => {
    if (!user) return
    try {
      const response = await fetch(`/api/users/${username}/follow?follower=${user.username}`)
      if (response.ok) {
        const data = await response.json()
        setIsFollowing(data.isFollowing)
        console.log(`Follow status for ${username}:`, data.isFollowing)
      } else {
        console.error('Failed to check follow status:', response.status)
        setIsFollowing(false)
      }
    } catch (error) {
      console.error('Error checking follow status:', error)
      setIsFollowing(false)
    }
  }

  const handleFollow = async () => {
    if (!user || !profileUser) return
    
    setIsFollowLoading(true)
    try {
      const response = await fetch(`/api/users/${profileUser.username}/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ follower: user.username }),
      })

      if (response.ok) {
        const data = await response.json()
        setIsFollowing(data.isFollowing)
        console.log(`${data.isFollowing ? 'Followed' : 'Unfollowed'} ${profileUser.username}`)
        
        // Update follower count
        setProfileUser(prev => prev ? {
          ...prev,
          follower_count: data.isFollowing 
            ? prev.follower_count + 1 
            : prev.follower_count - 1
        } : null)
      } else {
        console.error('Failed to toggle follow:', response.status)
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
    } finally {
      setIsFollowLoading(false)
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

  if (isLoadingProfile) {
    return (
      <Layout>
        <div className="flex-1 border-x border-border max-w-4xl mx-auto">
          <div className="p-8 text-center">
            <div className="animate-pulse space-y-4">
              <div className="w-24 h-24 bg-accent rounded-full mx-auto"></div>
              <div className="h-6 bg-accent rounded w-48 mx-auto"></div>
              <div className="h-4 bg-accent rounded w-32 mx-auto"></div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (!profileUser) {
    return (
      <Layout>
        <div className="flex-1 border-x border-border max-w-4xl mx-auto">
          <div className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">User Not Found</h2>
            <p className="text-muted-foreground">This user doesn't exist.</p>
            <Link href="/explore">
              <Button className="mt-4">Back to Explore</Button>
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  const isOwnProfile = user?.username === profileUser.username

  return (
    <Layout>
      <div className="flex-1 border-x border-border max-w-4xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center p-4 space-x-4">
            <Link href="/explore">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">
                {profileUser.display_name || profileUser.username}
              </h1>
              <p className="text-sm text-muted-foreground">
                {profileUser.post_count} posts
              </p>
            </div>
          </div>
        </div>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-accent to-purple-900 flex items-center justify-center flex-shrink-0">
                <Users className="h-12 w-12 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h1 className="text-2xl font-bold">
                    {profileUser.display_name || profileUser.username}
                  </h1>
                  {profileUser.is_verified && (
                    <Badge variant="secondary" className="text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">@{profileUser.username}</p>
                {profileUser.wallet_address && (
                  <div className="flex items-center space-x-2 mt-1">
                    <Wallet className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-mono">
                      {profileUser.wallet_address.slice(0, 8)}...{profileUser.wallet_address.slice(-8)}
                    </span>
                    <button
                      onClick={() => navigator.clipboard.writeText(profileUser.wallet_address)}
                      className="text-xs text-blue-500 hover:text-blue-400 ml-1"
                      title="Copy wallet address"
                    >
                      Copy
                    </button>
                  </div>
                )}
                {profileUser.bio && (
                  <p className="mt-2 text-sm">{profileUser.bio}</p>
                )}
                <div className="flex items-center space-x-1 mt-2 text-xs text-muted-foreground">
                  <CalendarDays className="h-3 w-3" />
                  <span>Joined {formatDate(profileUser.created_at)}</span>
                </div>
              </div>
            </div>
            
            {/* Follow Button */}
            {!isOwnProfile && user && (
              <Button
                onClick={handleFollow}
                disabled={isFollowLoading}
                variant={isFollowing ? "outline" : "default"}
                className={`min-w-[100px] ${
                  isFollowing 
                    ? "hover:bg-red-500 hover:text-white hover:border-red-500" 
                    : "bg-primary hover:bg-primary/90"
                }`}
              >
                {isFollowLoading ? (
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : isFollowing ? (
                  <>
                    <UserMinus className="h-4 w-4 mr-2" />
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Follow
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 text-center bg-accent/20 rounded-lg p-4">
            <div>
              <p className="text-2xl font-bold text-primary">{profileUser.post_count}</p>
              <p className="text-xs text-muted-foreground">Posts</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-500">{profileUser.total_shields_received}</p>
              <p className="text-xs text-muted-foreground">Shields</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-500">{profileUser.following_count}</p>
              <p className="text-xs text-muted-foreground">Following</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-500">{profileUser.follower_count}</p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mx-4 mb-4">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="nfts">NFTs ({userNFTs.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            {isLoadingPosts ? (
              <div className="flex items-center justify-center p-8">
                <div className="w-6 h-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
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
                onComment={() => {}}
              />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No posts yet</p>
                <p>@{profileUser.username} hasn't posted anything yet.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="nfts">
            {isLoadingNFTs ? (
              <div className="flex items-center justify-center p-8">
                <div className="w-6 h-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="ml-2 text-sm text-muted-foreground">Loading NFTs...</span>
              </div>
            ) : userNFTs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {userNFTs.map((nft) => (
                  <motion.div
                    key={nft.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-card border border-border rounded-lg overflow-hidden"
                  >
                    <div className="aspect-square bg-gradient-to-br from-accent to-purple-900 flex items-center justify-center">
                      {nft.image_url ? (
                        <img 
                          src={nft.image_url} 
                          alt={nft.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Trophy className="h-16 w-16 text-primary opacity-50" />
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm truncate">{nft.name}</h3>
                      {nft.collection_name && (
                        <p className="text-xs text-muted-foreground truncate">
                          {nft.collection_name}
                        </p>
                      )}
                      <div className="flex justify-between items-center mt-2">
                        {nft.floor_price && (
                          <span className="text-xs font-medium text-green-500">
                            ◎ {nft.floor_price}
                          </span>
                        )}
                        {nft.rarity_rank && (
                          <span className="text-xs text-muted-foreground">
                            #{nft.rarity_rank}
                          </span>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" className="w-full mt-2 text-xs">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View on Solscan
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No NFTs yet</p>
                <p>@{profileUser.username} doesn't own any NFTs.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}
