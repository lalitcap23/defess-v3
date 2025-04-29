"use client"

import { Tweet } from "@/components/tweet"

interface Tweet {
  id: string
  content: string
  username: string
  likes: number
  timestamp: Date
}

interface TweetFeedProps {
  tweets: Tweet[]
  onLike: (id: string) => void
}

export function TweetFeed({ tweets, onLike }: TweetFeedProps) {
  return (
    <div className="divide-y divide-border">
      {tweets.map((tweet) => (
        <div key={tweet.id} className="p-4 hover:bg-gray-50">
          <div className="flex items-start space-x-3">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">{tweet.username}</span>
                <span className="text-gray-500 text-sm">
                  {tweet.timestamp.toLocaleDateString()}
                </span>
              </div>
              <p className="mt-1 text-gray-900">{tweet.content}</p>
              <div className="mt-2 flex items-center space-x-4">
                <button
                  onClick={() => onLike(tweet.id)}
                  className="flex items-center space-x-1 text-gray-500 hover:text-red-500"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <span>{tweet.likes}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
