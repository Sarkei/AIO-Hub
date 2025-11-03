'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const mainRef = useRef<HTMLElement>(null)
  const pathname = usePathname()

  // Scroll to top of main content on route change
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0
    }
  }, [pathname])

  return (
    <main 
      ref={mainRef}
      className="flex-1 min-w-0 overflow-auto"
      style={{
        height: '100vh',
        position: 'relative'
      }}
    >
      {children}
    </main>
  )
}
