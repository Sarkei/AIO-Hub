/**
 * Dashboard Page - Modern Hub View
 * Inspired by: Notion, Linear, ClickUp, Apple Fitness
 */

'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import AppLayout from '@/components/AppLayout'
import Card from '@/components/ui/Card'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" 
             style={{ borderColor: 'rgb(var(--accent))' }}></div>
      </div>
    )
  }

  // Tageszeit-basierte Begrüßung
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Guten Morgen' : hour < 18 ? 'Guten Tag' : 'Guten Abend'

  return (
    <AppLayout>
      <div className="min-h-screen" style={{ backgroundColor: 'rgb(var(--bg))' }}>
        {/* Header */}
        <div className="px-8 py-6 border-b" style={{ 
          backgroundColor: 'rgb(var(--bg-elevated))',
          borderColor: 'rgb(var(--card-border))'
        }}>
          <h1 className="text-3xl font-bold mb-1" style={{ color: 'rgb(var(--fg))' }}>
            {greeting}, {user.username}! 👋
          </h1>
          <p className="text-sm" style={{ color: 'rgb(var(--fg-muted))' }}>
            Hier ist deine Übersicht für heute
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-8 py-8">
          {/* Quick Stats Row */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'rgb(var(--fg))' }}>
              📊 Auf einen Blick
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <QuickStatCard
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>}
                label="Offene Todos"
                value="4"
                subtext="2 heute fällig"
                color="accent"
              />
              <QuickStatCard
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>}
                label="Nächster Termin"
                value="14:30"
                subtext="Team Meeting"
                color="success"
              />
              <QuickStatCard
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>}
                label="Workout Streak"
                value="5 Tage"
                subtext="Weiter so!"
                color="warning"
              />
              <QuickStatCard
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>}
                label="Kalorien heute"
                value="1.850"
                subtext="von 2.500 kcal"
                color="accent"
              />
            </div>
          </div>

          {/* Module Grid */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'rgb(var(--fg))' }}>
              🏠 Deine Module
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <ModuleCard
                icon="✅"
                title="Todos"
                description="Kanban-Board"
                badge="4 offen"
                link="/todos"
              />
              <ModuleCard
                icon="📅"
                title="Termine"
                description="Terminplaner"
                badge="2 heute"
                link="/events"
              />
              <ModuleCard
                icon="🗓️"
                title="Kalender"
                description="Monatsansicht"
                badge=""
                link="/calendar"
              />
              <ModuleCard
                icon="💪"
                title="Körperdaten"
                description="Body Metrics"
                badge="Letzter Eintrag: Heute"
                link="/body-metrics"
              />
              <ModuleCard
                icon="🏋️"
                title="Gym"
                description="Workout Tracker"
                badge="5 Tage Streak"
                link="/gym"
              />
              <ModuleCard
                icon="🍎"
                title="Ernährung"
                description="Makro-Tracker"
                badge="1.850 / 2.500 kcal"
                link="/nutrition"
              />
            </div>
          </div>

          {/* Coming Soon Section */}
          <div>
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'rgb(var(--fg))' }}>
              🚧 In Entwicklung
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <ComingSoonCard icon="💼" title="Arbeit" description="Work & Projects" />
              <ComingSoonCard icon="🎓" title="Schule" description="Learning & Education" />
              <ComingSoonCard icon="💰" title="Finanzen" description="Budget & Expenses" />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

// Quick Stat Card Component
function QuickStatCard({ 
  icon, 
  label, 
  value, 
  subtext, 
  color 
}: { 
  icon: React.ReactNode
  label: string
  value: string
  subtext: string
  color: 'accent' | 'success' | 'warning'
}) {
  const colorMap = {
    accent: 'var(--accent)',
    success: 'var(--success)',
    warning: 'var(--warning)'
  }

  return (
    <div className="card p-4">
      <div className="flex items-start gap-3">
        <div 
          className="p-2 rounded-lg"
          style={{ backgroundColor: `rgba(${colorMap[color]}, 0.15)`, color: `rgb(${colorMap[color]})` }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs mb-1" style={{ color: 'rgb(var(--fg-muted))' }}>
            {label}
          </p>
          <p className="text-2xl font-bold mb-0.5" style={{ color: 'rgb(var(--fg))' }}>
            {value}
          </p>
          <p className="text-xs truncate" style={{ color: 'rgb(var(--fg-subtle))' }}>
            {subtext}
          </p>
        </div>
      </div>
    </div>
  )
}

// Module Card Component
function ModuleCard({ 
  icon, 
  title, 
  description, 
  badge, 
  link 
}: { 
  icon: string
  title: string
  description: string
  badge: string
  link?: string
}) {
  const router = useRouter()

  const handleClick = () => {
    if (link) router.push(link)
  }

  return (
    <div
      onClick={handleClick}
      className="card p-5 cursor-pointer group transition-all"
      style={{
        transform: 'translateY(0)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.borderColor = 'rgb(var(--accent))'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = 'rgb(var(--card-border))'
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-3xl">{icon}</div>
        {badge && (
          <span 
            className="text-xs px-2 py-1 rounded-md font-medium"
            style={{ 
              backgroundColor: 'rgba(var(--accent), 0.12)',
              color: 'rgb(var(--accent))'
            }}
          >
            {badge}
          </span>
        )}
      </div>
      <h3 className="text-lg font-semibold mb-1" style={{ color: 'rgb(var(--fg))' }}>
        {title}
      </h3>
      <p className="text-sm" style={{ color: 'rgb(var(--fg-muted))' }}>
        {description}
      </p>
    </div>
  )
}

// Coming Soon Card Component
function ComingSoonCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: string
  title: string
  description: string
}) {
  return (
    <div 
      className="card p-5 opacity-60 cursor-not-allowed"
      style={{ backgroundColor: 'rgb(var(--bg-elevated))' }}
    >
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold mb-1" style={{ color: 'rgb(var(--fg))' }}>
        {title}
      </h3>
      <p className="text-sm" style={{ color: 'rgb(var(--fg-muted))' }}>
        {description}
      </p>
      <div className="mt-3 inline-block">
        <span 
          className="text-xs px-2 py-1 rounded-md font-medium"
          style={{ 
            backgroundColor: 'rgba(var(--fg-subtle), 0.15)',
            color: 'rgb(var(--fg-subtle))'
          }}
        >
          Kommt bald
        </span>
      </div>
    </div>
  )
}
