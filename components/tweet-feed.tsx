"use client"

import { Tweet } from "@/components/tweet"

interface TweetData {
  id: string
  content: string
  likes: number
  timestamp: Date
}

export function TweetFeed({
  tweets,
  onLike,
}: {
  tweets: TweetData[]
  onLike: (id: string) => void
}) {
  return (
    <div>
      {tweets.map((tweet) => (
        <Tweet key={tweet.id} tweet={tweet} onLike={() => onLike(tweet.id)} />
      ))}
    </div>
  )
}
