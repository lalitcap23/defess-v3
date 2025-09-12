import type { Metadata } from 'next'
import './globals.css'
import { WalletContextProvider } from '@/contexts/WalletContext'

export const metadata: Metadata = {
  title: 'Defess v3',
  description: 'Decentralized social platform on Solana',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <WalletContextProvider>
          {children}
        </WalletContextProvider>
      </body>
    </html>
  )
}
