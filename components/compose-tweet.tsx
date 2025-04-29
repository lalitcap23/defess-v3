"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { User } from "lucide-react"

export function ComposeTweet({ onTweet }: { onTweet: (content: string) => void }) {
  const [content, setContent] = useState("")

  const handleSubmit = () => {
    if (content.trim()) {
      onTweet(content)
      setContent("")
    }
  }

  return (
    <div className="border-b border-border p-4">
      <div className="flex">
        <div className="mr-4">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <User className="h-6 w-6" />
          </div>
        </div>
        <div className="flex-1">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening?"
            className="border-none resize-none text-xl bg-transparent focus-visible:ring-0 p-0 h-24"
          />
          <div className="flex justify-end items-center mt-4">
            <Button
              onClick={handleSubmit}
              disabled={!content.trim()}
              className="rounded-full bg-primary hover:bg-primary/90"
            >
              Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
