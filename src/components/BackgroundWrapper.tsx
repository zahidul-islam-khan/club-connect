'use client'

import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

interface BackgroundWrapperProps {
  children: ReactNode
}

export default function BackgroundWrapper({ children }: BackgroundWrapperProps) {
  const pathname = usePathname()
  
  // Don't apply aerial background to the clubs page as it has its own concert theme
  const isClubsPage = pathname === '/clubs'
  
  if (isClubsPage) {
    return <>{children}</>
  }
  
  return (
    <div className="min-h-screen aerial-view-background">
      {children}
    </div>
  )
}