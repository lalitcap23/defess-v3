"use client"

import { Search, Settings, Laugh } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function TrendingSection() {
  const hallOfFameStories = [
    {
      title: "🧻 ToiletCoin Rugged",
      description: "Promised bathroom on Mars. CEO vanished mid flush.",
      likes: "8 shames"
    },
    {
      title: "🥩 SteakSwap Exit",
      description: "Devs ran off after meat emojis pumped the chart.",
      likes: "5 shames"
    },
    {
      title: "📦 BoxChain Crash",
      description: "Literally just boxes. Raised $4M. Still no utility.",
      likes: "2 shames"
    },
    {
      title: "🛸 AlienYieldFarm",
      description: "Claimed aliens backed the token. Community believed it.",
      likes: "0 shames"
    }
  ]

  return (
    <div className="w-80 sticky top-0 h-screen p-4 hidden lg:block">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input placeholder="Search" className="pl-10 bg-muted rounded-full" />
        </div>

        <div className="bg-muted rounded-xl p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-xl flex items-center gap-2">
              <Laugh className="h-5 w-5 text-yellow-500" />
              Hall of shame
            </h2>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Settings className="h-5 w-5" />
            </Button>
          </div>

          <div className="space-y-4">
            {hallOfFameStories.map((story, index) => (
              <div key={index} className="hover:bg-background/50 p-2 rounded-lg cursor-pointer">
                <p className="font-bold">{story.title}</p>
                <p className="text-sm text-muted-foreground">{story.description}</p>
                <p className="text-xs text-muted-foreground">{story.likes}</p>
              </div>
            ))}
          </div>

          <Button variant="ghost" className="text-primary w-full justify-start mt-2">
            Show more
          </Button>
        </div>
      </div>
    </div>
  )
}
