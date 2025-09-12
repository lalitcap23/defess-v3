'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { ConnectionProvider, WalletProvider, useWallet as useSolanaWallet } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter, SolflareWalletAdapter, TorusWalletAdapter } from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from '@solana/web3.js'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

// Import wallet adapter CSS
require('@solana/wallet-adapter-react-ui/styles.css')

const wallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter(),
  new TorusWalletAdapter(),
]

interface User {
  id: string
  wallet_address: string
  username: string
}

interface UserContextType {
  user: User | null
  isLoading: boolean
  setUsername: (username: string) => Promise<boolean>
  logout: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

// Custom hook that combines Solana wallet and user context
export const useWallet = () => {
  const solanaWallet = useSolanaWallet()
  const userContext = useUser()
  
  return {
    ...solanaWallet,
    username: userContext.user?.username || null,
    user: userContext.user,
    isLoading: userContext.isLoading,
    setUsername: userContext.setUsername,
    logout: userContext.logout
  }
}

export function WalletContextProvider({ children }: { children: ReactNode }) {
  const endpoint = clusterApiUrl('devnet') // Change to 'mainnet-beta' for production

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <UserProvider>
            {children}
          </UserProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

function UserProvider({ children }: { children: ReactNode }) {
  const { publicKey } = useSolanaWallet()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (publicKey) {
      checkOrCreateUser(publicKey.toString())
    } else {
      setUser(null)
    }
  }, [publicKey])

  const checkOrCreateUser = async (walletAddress: string) => {
    if (!isSupabaseConfigured() || !supabase) {
      console.warn('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.')
      return
    }

    console.log('🔍 Checking user for wallet:', walletAddress)
    setIsLoading(true)
    try {
      // Check if user exists
      const { data: existingUser, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single()

      console.log('📊 Supabase response:', { existingUser, error })

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "not found" error
        console.error('❌ Error checking user:', error)
        return
      }

      if (existingUser) {
        console.log('✅ Existing user found:', existingUser)
        setUser(existingUser)
      } else {
        console.log('👤 No user found, need to create username')
        // User doesn't exist, they need to set a username
        setUser(null)
      }
    } catch (error) {
      console.error('💥 Error in checkOrCreateUser:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const setUsername = async (username: string): Promise<boolean> => {
    if (!publicKey || !isSupabaseConfigured() || !supabase) {
      console.error('❌ Missing requirements:', { 
        hasPublicKey: !!publicKey, 
        isConfigured: isSupabaseConfigured(), 
        hasSupabase: !!supabase 
      })
      return false
    }

    try {
      console.log('🚀 Creating username:', username, 'for wallet:', publicKey.toString())
      setIsLoading(true)

      // Check if username is already taken
      const { data: existingUsername, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single()

      console.log('🔍 Username check result:', { existingUsername, checkError })

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ Error checking username:', checkError)
        alert('Error checking username availability. Please try again.')
        return false
      }

      if (existingUsername) {
        console.log('⚠️ Username already taken')
        alert('Username already taken. Please choose a different one.')
        return false
      }

      // Create new user
      console.log('📝 Creating new user...')
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          wallet_address: publicKey.toString(),
          username: username,
        })
        .select()
        .single()

      console.log('📊 User creation result:', { newUser, error })

      if (error) {
        console.error('❌ Error creating user:', error)
        alert(`Error creating user: ${error.message}`)
        return false
      }

      console.log('✅ User created successfully:', newUser)
      setUser(newUser)
      return true
    } catch (error) {
      console.error('💥 Error setting username:', error)
      alert('Error setting username. Please try again.')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
  }

  return (
    <UserContext.Provider value={{ user, isLoading, setUsername, logout }}>
      {children}
    </UserContext.Provider>
  )
}
