import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Curie - Claim Your Profile',
  description: 'Claim your Curie profile to unlock exclusive features',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

