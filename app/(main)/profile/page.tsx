'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

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
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Your Profile</h1>

        <Card className="border rounded-xl shadow-sm">
          <CardContent className="p-6 space-y-5">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>LL</AvatarFallback>
                  </Avatar>
                  <p className="text-lg font-medium text-gray-900">{data?.username}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Connected Address</p>
                  <p className="font-mono text-sm break-all">{data?.connectedAddress}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Most Confessed</p>
                  <p className="italic text-gray-700">“{data?.mostConfessed}”</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
