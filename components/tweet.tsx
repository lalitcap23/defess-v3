"use client"

import { formatDistanceToNow } from "date-fns"
import { Trophy, User } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TweetProps {
  tweet: {
    id: string
    content: string
    likes: number
    timestamp: Date
  }
  onLike: () => void
}

export function Tweet({ tweet, onLike }: TweetProps) {
  const timeAgo = formatDistanceToNow(new Date(tweet.timestamp), { addSuffix: true })

  return (
    <div className="border-b border-border p-4 hover:bg-muted/30 transition-colors">
      <div className="flex">
        <div className="mr-4">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <User className="h-6 w-6" />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center">
            <span className="font-bold">Anonymous</span>
            <span className="text-muted-foreground ml-2 text-sm">@anonymous · {timeAgo}</span>
          </div>

          <div className="mt-1 text-[15px] whitespace-pre-wrap">{tweet.content}</div>

          <div className="flex justify-start mt-3 max-w-md text-muted-foreground">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full hover:text-yellow-500 hover:bg-yellow-500/10"
              onClick={onLike}
            >
              <Trophy className="h-4 w-4 mr-2" />
              <span className="text-xs">{tweet.likes}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
