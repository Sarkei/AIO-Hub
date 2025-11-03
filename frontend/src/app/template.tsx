'use client'

import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Sidebar from '@/components/Sidebar'
import { useEffect, useRef } from 'react'

/**
 * Template Component - Persists across route changes
 * This prevents the Sidebar from re-mounting on navigation
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user } = useAuth()
  const mainRef = useRef<HTMLDivElement>(null)
  
  // Routes that don't need the sidebar
  const publicRoutes = ['/login', '/register', '/']
  const isPublicRoute = publicRoutes.includes(pathname)
  
  // Scroll to top of main content on route change
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0
    }
  }, [pathname])

  // If it's a public route or user is not logged in, render without sidebar
  if (isPublicRoute || !user) {
    return <>{children}</>
  }

  // Render with sidebar for authenticated routes
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex">
      <Sidebar />
      <div 
        ref={mainRef}
        className="flex-1 min-w-0 overflow-auto"
        style={{
          height: '100vh',
          position: 'relative'
        }}
      >
        {children}
      </div>
    </div>
  )
}
