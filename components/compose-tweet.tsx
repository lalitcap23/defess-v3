"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { User, Image, Link, Smile, X } from "lucide-react"
import { motion } from "framer-motion"

export function ComposeTweet({ onTweet }: { onTweet: (content: string) => void }) {
  const [content, setContent] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSubmit = () => {
    if (content.trim()) {
      onTweet(content)
      setContent("")
      setIsExpanded(false)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b border-border/50 p-4 bg-background/50 backdrop-blur-sm"
    >
      <div className="flex">
        <div className="mr-4">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center text-white shadow-lg"
          >
            <User className="h-6 w-6" />
          </motion.div>
        </div>
        <div className="flex-1 space-y-4">
          <Textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value)
              setIsExpanded(true)
            }}
            onClick={() => setIsExpanded(true)}
            placeholder="What's on your mind?"
            className="min-h-[60px] resize-none text-lg bg-transparent border-none focus-visible:ring-0 p-0 placeholder:text-muted-foreground/50"
          />
          
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center justify-between"
            >
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary">
                  <Image className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary">
                  <Link className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary">
                  <Smile className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="h-6 w-px bg-border" />
                <Button
                  onClick={handleSubmit}
                  disabled={!content.trim()}
                  className="rounded-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Confess
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}