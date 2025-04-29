"use client"

import { motion, AnimatePresence } from "framer-motion"
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
    <div className="divide-y divide-border/50">
      <AnimatePresence>
        {tweets.map((tweet, index) => (
          <motion.div
            key={tweet.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.1 }}
            className="group"
          >
            <Tweet tweet={tweet} onLike={() => onLike(tweet.id)} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}