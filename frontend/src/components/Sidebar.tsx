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
    <aside className="h-screen sticky top-0 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800">
        <div className="text-xl font-bold text-gray-900 dark:text-white">AIO Hub</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">Willkommen{user ? `, ${user.username}` : ''}</div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md mx-2 transition-colors ${
                    active
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="w-5 text-center">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-3 border-t border-gray-200 dark:border-gray-800 space-y-2">
        <ThemeToggle />
        <button
          onClick={logout}
          className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          Abmelden
        </button>
      </div>
    </aside>
  )
}
