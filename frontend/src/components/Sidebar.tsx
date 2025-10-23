/**
 * ════════════════════════════════════════════════════════════════════════════
 * 🧭 Sidebar Navigation - Linear/Notion-inspired Design
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * Features:
 * - Clean, minimal design with clear hierarchy
 * - Active state with accent indicator bar (Linear-style)
 * - Smooth hover transitions with background + scale effect
 * - Gradient logo badge
 * - Icon-first navigation with consistent spacing
 * - Theme toggle integrated seamlessly
 * - User profile section with avatar placeholder
 * 
 * UX Improvements:
 * - Active indicator bar on left (better visual feedback)
 * - Icon alignment for better scannability
 * - Hover effects with subtle scale (0.98 → 1.0)
 * - Focus states for keyboard navigation
 * - Smooth transitions (150ms) on all interactions
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import ThemeToggle from './ThemeToggle'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '🚀' },
  { href: '/todos', label: 'Todos', icon: '✅' },
  { href: '/events', label: 'Termine', icon: '📅' },
  { href: '/calendar', label: 'Kalender', icon: '🗓️' },
  { href: '/body-metrics', label: 'Körperdaten', icon: '💪' },
  { href: '/gym', label: 'Gym', icon: '🏋️' },
  { href: '/nutrition', label: 'Ernährung', icon: '🍎' },
  { href: '/finance', label: 'Finanzen', icon: '💰' },
  { href: '/goals', label: 'Ziele & Habits', icon: '🎯' },
  { href: '/settings', label: 'Einstellungen', icon: '⚙️' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <aside 
      className="h-screen sticky top-0 w-64 flex flex-col"
      style={{ 
        backgroundColor: 'rgb(var(--bg-elevated))',
        borderRight: '1px solid rgb(var(--card-border))'
      }}
    >
      {/* Logo Section */}
      <div 
        className="px-6 py-5"
        style={{ borderBottom: '1px solid rgb(var(--card-border))' }}
      >
        <div className="flex items-center gap-3">
          {/* Gradient Logo Badge */}
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ 
              background: 'linear-gradient(135deg, rgb(var(--accent)) 0%, rgb(var(--accent-hover)) 100%)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} 
                    d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          
          <div>
            <div className="text-base font-bold" style={{ color: 'rgb(var(--fg))' }}>
              AIO Hub
            </div>
            <div className="text-xs" style={{ color: 'rgb(var(--fg-subtle))' }}>
              All-in-One
            </div>
          </div>
        </div>
      </div>

      {/* User Profile Section */}
      {user && (
        <div className="px-4 py-3">
          <div 
            className="flex items-center gap-3 p-3 rounded-lg transition-all"
            style={{
              backgroundColor: 'rgba(var(--accent), 0.06)',
              border: '1px solid rgba(var(--accent), 0.12)'
            }}
          >
            {/* Avatar Placeholder */}
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
              style={{ 
                background: 'linear-gradient(135deg, rgb(var(--accent)) 0%, rgb(var(--accent-hover)) 100%)',
                color: 'white'
              }}
            >
              {user.username.charAt(0).toUpperCase()}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate" style={{ color: 'rgb(var(--fg))' }}>
                {user.username}
              </div>
              <div className="text-xs truncate" style={{ color: 'rgb(var(--fg-muted))' }}>
                {user.email || 'Online'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group"
                  style={{
                    backgroundColor: active ? 'rgba(var(--accent), 0.12)' : 'transparent',
                    color: active ? 'rgb(var(--accent))' : 'rgb(var(--fg-muted))',
                    transform: 'scale(1)',
                    transition: 'all var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'rgba(var(--fg), 0.06)'
                      e.currentTarget.style.color = 'rgb(var(--fg))'
                      e.currentTarget.style.transform = 'scale(1.02)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.color = 'rgb(var(--fg-muted))'
                      e.currentTarget.style.transform = 'scale(1)'
                    }
                  }}
                >
                  {/* Active Indicator Bar (Linear-style) */}
                  {active && (
                    <div 
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                      style={{ 
                        backgroundColor: 'rgb(var(--accent))',
                        boxShadow: '0 0 8px rgba(var(--accent), 0.5)'
                      }}
                    />
                  )}
                  
                  <span className="text-lg w-6 flex items-center justify-center">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  
                  {/* Hover Arrow (appears on hover) */}
                  <span 
                    className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: 'rgb(var(--fg-subtle))' }}
                  >
                    →
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div 
        className="p-3 space-y-2"
        style={{ borderTop: '1px solid rgb(var(--card-border))' }}
      >
        <ThemeToggle />
        
        <button
          onClick={logout}
          className="w-full px-3 py-2 text-sm font-medium rounded-lg transition-all"
          style={{
            color: 'rgb(var(--danger))',
            backgroundColor: 'transparent',
            border: '1px solid rgba(var(--danger), 0.3)',
            transition: 'all var(--transition-fast)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(var(--danger), 0.1)'
            e.currentTarget.style.borderColor = 'rgb(var(--danger))'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.borderColor = 'rgba(var(--danger), 0.3)'
          }}
        >
          🚪 Abmelden
        </button>
      </div>
    </aside>
  )
}
