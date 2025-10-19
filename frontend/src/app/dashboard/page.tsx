/**
 * Dashboard Page - Hauptansicht nach Login
 */

'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🚀 AIO Hub
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Willkommen, {user.username}
            </span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bereichs-Auswahl */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              🏠 Privat
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Todos, Termine, Fitness & Ernährung
            </p>
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-700/50 p-6 rounded-lg shadow opacity-50 cursor-not-allowed">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              💼 Arbeit
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Kommt bald...
            </p>
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-700/50 p-6 rounded-lg shadow opacity-50 cursor-not-allowed">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              🎓 Schule
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Kommt bald...
            </p>
          </div>
        </div>

        {/* Privat-Bereich Module */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Privat - Module
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <ModuleCard title="✅ Todos" subtitle="Kanban-Board" link="/todos" />
            <ModuleCard title="📅 Termine" subtitle="Terminplaner" link="/events" />
            <ModuleCard title="🗓️ Kalender" subtitle="Monats-/Wochenansicht" link="/calendar" />
            <ModuleCard title="💪 Körperdaten" subtitle="BodyMetrics" link="/body-metrics" />
            <ModuleCard title="🏋️ Gym" subtitle="Workout-Tracker" link="/gym" />
            <ModuleCard title="🍎 Ernährung" subtitle="Makro-Tracker" link="/nutrition" />
          </div>
        </div>
      </main>
    </div>
  )
}

function ModuleCard({ title, subtitle, link }: { title: string; subtitle: string; link?: string }) {
  const router = useRouter()
  
  const handleClick = () => {
    if (link) {
      router.push(link)
    }
  }
  
  return (
    <div 
      onClick={handleClick}
      className={`border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow ${
        link ? 'cursor-pointer hover:border-primary-500' : 'opacity-50 cursor-not-allowed'
      }`}
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
        {title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
    </div>
  )
}
