"use client"

import { Home, Mail, User, MoreHorizontal, Hash, Feather, Info, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import Cnw  from "@/components/wallet-button"

export function Sidebar() {
  const menuItems = [
    { icon: Home, label: "Home", active: true },
    { icon: Hash, label: "Find" },
    { icon: Trophy, label: "Hall of shame" },
    { icon: User, label: "Profile" },
    { icon: Info, label: "About" },
  ]

  return (
    <div className="w-64 sticky top-0 h-screen p-4">
      <div className="flex flex-col h-full justify-between">
        <div className="space-y-6">
          <div className="p-2">
            <h1 className="text-2xl font-bold text-primary">Defess</h1>
          </div>
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Button
                key={item.label}
                variant={item.active ? "default" : "ghost"}
                className={`w-full justify-start text-lg font-medium ${
                  item.active ? "bg-primary/10 text-primary hover:bg-primary/20" : ""
                }`}
              >
                <item.icon className="mr-4 h-6 w-6" />
                {item.label}
              </Button>
            ))}
          </nav>
          <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-full py-6">
            <Feather className="mr-2 h-5 w-5" />
            Confess
          </Button>
        </div>
        <div className="mb-4">
          <Button variant="ghost" className="w-full justify-start">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mr-2">
                <User className="h-6 w-6" />
              </div>
              <div className="text-left">
                <p className="font-semibold">Anonymous</p>
                <p className="text-muted-foreground text-sm">@anonymous</p>
              </div>
            </div>
          </Button>
          {/* <Cnw></Cnw> */}
        </div>
      </div>
    </div>
  )
}
