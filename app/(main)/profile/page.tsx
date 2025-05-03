'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Share2, Settings, Edit2, Github, Twitter, Linkedin, Trophy, Calendar, Clock, Star } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

type ProfileData = {
  username: string
  mostConfessed: string
  connectedAddress: string
}

export default function ProfilePage() {
  const [data, setData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(profile => {
        setData(profile)
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Hero Section */}
      <div className="relative h-[400px] bg-gradient-to-r from-purple-900/50 to-blue-900/50">
        <div className="absolute inset-0 bg-black/60" />
        <div className="container mx-auto px-4 h-full flex items-end pb-8 relative">
          <div className="flex items-end gap-6">
            <div className="relative -mb-16">
              <Avatar className="w-32 h-32 border-4 border-white/20">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="text-4xl bg-purple-600">LL</AvatarFallback>
              </Avatar>
            </div>
            <div className="text-white mb-4">
              <h1 className="text-4xl font-bold mb-2">{data?.username || 'Loading...'}</h1>
              <div className="flex gap-2">
                <Badge variant="secondary" className="bg-white/10 text-white border-none">
                  Developer
                </Badge>
                <Badge variant="secondary" className="bg-white/10 text-white border-none">
                  Web3 Enthusiast
                </Badge>
                <Badge variant="secondary" className="bg-white/10 text-white border-none">
                  Early Adopter
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="md:col-span-2 space-y-6">
            <Card className="border-0 bg-gray-900/50">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">About</h2>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Connected Address</p>
                    <p className="font-mono text-sm break-all bg-gray-800/50 p-3 rounded-lg">
                      {data?.connectedAddress}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Most Confessed</p>
                    <p className="text-gray-300 bg-gray-800/50 p-3 rounded-lg italic">
                      "{data?.mostConfessed}"
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline Section */}
            <Card className="border-0 bg-gray-900/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-6">Timeline</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                    <div>
                      <p className="font-medium">New Confession</p>
                      <p className="text-sm text-gray-400">2 hours ago</p>
                      <p className="text-sm text-gray-300 mt-1">Shared a new confession about development practices</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                    <div>
                      <p className="font-medium">Profile Updated</p>
                      <p className="text-sm text-gray-400">1 day ago</p>
                      <p className="text-sm text-gray-300 mt-1">Updated profile information and preferences</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2" />
                    <div>
                      <p className="font-medium">Achievement Unlocked</p>
                      <p className="text-sm text-gray-400">3 days ago</p>
                      <p className="text-sm text-gray-300 mt-1">Reached 100 confessions milestone</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Stats & Actions */}
          <div className="space-y-6">
            {/* Stats Card */}
            <Card className="border-0 bg-gray-900/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-6">Stats</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-800/50 rounded-lg text-center">
                    <p className="text-2xl font-bold">42</p>
                    <p className="text-sm text-gray-400">Confessions</p>
                  </div>
                  <div className="p-4 bg-gray-800/50 rounded-lg text-center">
                    <p className="text-2xl font-bold">128</p>
                    <p className="text-sm text-gray-400">Followers</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Profile Completion</span>
                    <span className="text-gray-300">75%</span>
                  </div>
                  <Progress value={75} className="bg-gray-800" />
                </div>
              </CardContent>
            </Card>

            {/* Achievements Card */}
            <Card className="border-0 bg-gray-900/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Achievements
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                    <div className="p-2 bg-yellow-500/20 rounded-lg">
                      <Star className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div>
                      <p className="font-medium">Early Bird</p>
                      <p className="text-sm text-gray-400">Joined in the first week</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Calendar className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium">Consistent</p>
                      <p className="text-sm text-gray-400">7-day streak</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card className="border-0 bg-gray-900/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-6">Connect</h2>
                <div className="space-y-3">
                  <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white" variant="outline">
                    <Github className="w-4 h-4 mr-2" />
                    GitHub
                  </Button>
                  <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white" variant="outline">
                    <Twitter className="w-4 h-4 mr-2" />
                    Twitter
                  </Button>
                  <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white" variant="outline">
                    <Linkedin className="w-4 h-4 mr-2" />
                    LinkedIn
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 bg-gray-900/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
                <div className="space-y-3">
                  <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white" variant="outline">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Profile
                  </Button>
                  <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white" variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
