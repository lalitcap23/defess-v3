'use client'

import React, { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useUser } from '@/contexts/WalletContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Loader2, Wallet, User } from 'lucide-react'

export default function SolanaConnectButton() {
  const { connected, publicKey, disconnect } = useWallet()
  const { user, isLoading, setUsername } = useUser()
  const [showUsernameDialog, setShowUsernameDialog] = useState(false)
  const [usernameInput, setUsernameInput] = useState('')
  const [isSettingUsername, setIsSettingUsername] = useState(false)

  // Show username dialog when wallet is connected but user doesn't exist
  React.useEffect(() => {
    if (connected && publicKey && !user && !isLoading) {
      setShowUsernameDialog(true)
    }
  }, [connected, publicKey, user, isLoading])

  const handleSetUsername = async () => {
    if (!usernameInput.trim()) {
      alert('Please enter a username')
      return
    }

    if (usernameInput.length < 3) {
      alert('Username must be at least 3 characters long')
      return
    }

    if (usernameInput.length > 20) {
      alert('Username must be less than 20 characters long')
      return
    }

    // Basic username validation (alphanumeric and underscores only)
    const usernameRegex = /^[a-zA-Z0-9_]+$/
    if (!usernameRegex.test(usernameInput)) {
      alert('Username can only contain letters, numbers, and underscores')
      return
    }

    setIsSettingUsername(true)
    const success = await setUsername(usernameInput)
    
    if (success) {
      setShowUsernameDialog(false)
      setUsernameInput('')
    }
    
    setIsSettingUsername(false)
  }

  const handleDisconnect = () => {
    disconnect()
    setShowUsernameDialog(false)
    setUsernameInput('')
  }

  const formatPublicKey = (key: string) => {
    if (key.length <= 8) return key
    return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`
  }

  if (connected && user) {
    return (
      <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-800">@{user.username}</span>
        </div>
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-gray-600" />
          <span className="text-xs text-gray-600">
            {formatPublicKey(user.wallet_address)}
          </span>
        </div>
        <Button
          onClick={handleDisconnect}
          variant="outline"
          size="sm"
          className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
        >
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="wallet-adapter-button-wrapper">
        <WalletMultiButton 
          className="!bg-purple-600 hover:!bg-purple-700"
          style={{
            fontSize: '0px',
            color: 'transparent'
          }}
        />
      </div>

      {/* Username Setup Dialog */}
      <Dialog open={showUsernameDialog} onOpenChange={setShowUsernameDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-purple-600" />
              Choose Your Username
            </DialogTitle>
            <DialogDescription>
              This will be your unique identifier on the platform. You can&apos;t change it later.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <div className="flex items-center space-x-1">
                <span className="text-gray-500">@</span>
                <Input
                  id="username"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value.toLowerCase())}
                  placeholder="your_username"
                  className="flex-1"
                  maxLength={20}
                />
              </div>
              <p className="text-xs text-gray-500">
                3-20 characters, letters, numbers, and underscores only
              </p>
            </div>

            {publicKey && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Connected Wallet:</p>
                <p className="text-sm font-mono text-gray-800">
                  {formatPublicKey(publicKey.toString())}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => handleDisconnect()}
                variant="outline"
                className="flex-1"
                disabled={isSettingUsername}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSetUsername}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                disabled={isSettingUsername || !usernameInput.trim()}
              >
                {isSettingUsername && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Profile
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Loading State */}
      {connected && isLoading && (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
          <span className="ml-2 text-sm text-gray-600">Setting up your profile...</span>
        </div>
      )}
    </div>
  )
}
