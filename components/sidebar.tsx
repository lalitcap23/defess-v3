"use client"

import { Home, Mail, User, MoreHorizontal, Hash, Feather, Info, Trophy, LogOut, Settings, Wallet, Coins } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useUser } from "@/contexts/WalletContext"
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

export function Sidebar() {
  const pathname = usePathname()
  const { user, isLoading } = useUser()
  const { connected, publicKey, disconnect } = useWallet()
  
  const menuItems = [
    { icon: Home, label: "Home", href: "/", active: pathname === "/" },
    { icon: Hash, label: "Explore", href: "/explore", badge: "New", active: pathname === "/explore" },
    { icon: Trophy, label: "Hall of shame", href: "/leaderboard", badge: "4", active: pathname === "/leaderboard" },
    { icon: User, label: "Profile", href: "/profile", active: pathname === "/profile" },
    { icon: Coins, label: "Rewards", href: "/rewards", badge: user?.total_rewards_earned ? "◎" : undefined, active: pathname === "/rewards" },
    { icon: Settings, label: "Settings", href: "/settings", active: pathname === "/settings" },
    { icon: Info, label: "About", href: "/about", active: pathname === "/about" },
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
                <Link href={item.href} className="block">
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
                </Link>
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
          <Button 
            variant="ghost" 
            className="w-full justify-start hover:bg-red-500/10 hover:text-red-500"
            onClick={disconnect}
            disabled={!connected}
          >
            <LogOut className="mr-2 h-5 w-5" />
            {connected ? 'Disconnect' : 'Logout'}
          </Button>
          
          <div className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-purple-600/5 backdrop-blur-sm border border-border/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center text-white">
                  <User className="h-5 w-5" />
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  {user ? (
                    <>
                      <p className="font-semibold text-sm truncate">{user.username}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {publicKey ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}` : 'No wallet'}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-sm">Not logged in</p>
                      <p className="text-xs text-muted-foreground">Connect wallet to continue</p>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Rewards Section */}
            {user && (
              <div className="mb-3 p-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-md border border-yellow-500/20">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    <Trophy className="h-4 w-4 text-yellow-500 mr-2" />
                    <span className="text-xs font-medium text-yellow-600">Rewards</span>
                  </div>
                  <span className="text-xs font-bold text-yellow-600">
                    ◎ {user.total_rewards_earned || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                    <span className="text-xs text-red-400">Shields</span>
                  </div>
                  <span className="text-xs font-medium text-red-400">
                    {user.total_shields_received || 0}
                  </span>
                </div>
              </div>
            )}
            
            {/* Wallet Connection */}
            <div className="mt-2">
              {connected ? (
                <div className="flex items-center justify-between p-2 bg-green-500/10 rounded-md">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-xs text-green-600 font-medium">Wallet Connected</span>
                  </div>
                  <Wallet className="h-4 w-4 text-green-500" />
                </div>
              ) : (
                <div className="wallet-adapter-button-trigger">
                  <WalletMultiButton className="!bg-primary hover:!bg-primary/90 !rounded-md !text-sm !py-2 !px-3 !font-medium !w-full" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}