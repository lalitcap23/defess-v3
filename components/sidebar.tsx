"use client"

import { Home, Mail, User, MoreHorizontal, Hash, Feather, Info, Trophy, LogOut, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import Cnw from "@/components/wallet-button"
import { motion } from "framer-motion"

export function Sidebar() {
  const menuItems = [
    { icon: Home, label: "Home", active: true },
    { icon: Hash, label: "Explore", badge: "New" },
    { icon: Trophy, label: "Hall of shame", badge: "4" },
    { icon: User, label: "Profile" },
    { icon: Settings, label: "Settings" },
    { icon: Info, label: "About" },
  ]

  return (
    <div className="w-64 sticky top-0 h-screen p-4 bg-gradient-to-b from-background to-background/95 backdrop-blur-sm border-r border-border/50">
      <div className="flex flex-col h-full justify-between">
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-2"
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Defess
            </h1>
          </motion.div>
          
          <nav className="space-y-2">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  variant={item.active ? "default" : "ghost"}
                  className={`w-full justify-between text-lg font-medium group ${
                    item.active ? "bg-primary/10 text-primary hover:bg-primary/20" : ""
                  }`}
                >
                  <span className="flex items-center">
                    <item.icon className="mr-4 h-5 w-5" />
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Button>
              </motion.div>
            ))}
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white rounded-full py-6 shadow-lg hover:shadow-xl transition-all duration-200">
              <Feather className="mr-2 h-5 w-5" />
              Confess
            </Button>
          </motion.div>
        </div>

        <div className="space-y-4">
          <Button variant="ghost" className="w-full justify-start hover:bg-red-500/10 hover:text-red-500">
            <LogOut className="mr-2 h-5 w-5" />
            Logout
          </Button>
          
          <div className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-purple-600/5 backdrop-blur-sm border border-border/50">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center text-white">
                <User className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="font-semibold text-sm">Anonymous</p>
                <p className="text-xs text-muted-foreground">@anonymous</p>
              </div>
            </div>
            <Cnw />
          </div>
        </div>
      </div>
    </div>
  )
}