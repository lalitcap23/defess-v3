"use client"

import type React from "react"

import { Sidebar } from "@/components/sidebar"
import { TrendingSection } from "@/components/hos"

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto flex">
        <Sidebar />
        <main className="flex-1 flex">
          {children}
          <TrendingSection />
        </main>
      </div>
    </div>
  )
}
