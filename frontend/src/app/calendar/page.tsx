/**
 * ════════════════════════════════════════════════════════════════════════════
 * 🗓️ Calendar Page - Week View (Cron/Notion Calendar Inspired)
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * Features:
 * - Week grid with time blocks (6:00 - 23:00)
 * - Mini calendar sidebar for date navigation
 * - Drag & drop events (future enhancement)
 * - Keyboard shortcuts (←/→ for weeks, t for today)
 * - Event color coding by category
 * - Responsive design
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import AppLayout from '@/components/AppLayout'
import Button from '@/components/ui/Button'

interface Event {
  id: string
  user_id: string
  title: string
  description?: string
  location?: string
  start_time: string
  end_time: string
  all_day: boolean
  notes?: string
  created_at: string
  updated_at: string
}

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6) // 6:00 - 23:00
const DAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

export default function CalendarPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [view, setView] = useState<'week' | 'month'>('week')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const fetchEvents = useCallback(async () => {
    if (!user) return
    
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get('/api/events', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setEvents(res.data.events || [])
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPreviousWeek()
      } else if (e.key === 'ArrowRight') {
        goToNextWeek()
      } else if (e.key === 't' || e.key === 'T') {
        goToToday()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToPreviousWeek, goToNextWeek, goToToday])

  const getWeekDays = (date: Date): Date[] => {
    const start = new Date(date)
    const day = start.getDay()
    const diff = start.getDate() - day + (day === 0 ? -6 : 1) // Monday as first day
    start.setDate(diff)
    
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return d
    })
  }

  const goToToday = useCallback(() => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }, [])

  const goToPreviousWeek = useCallback(() => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setDate(newDate.getDate() - 7)
      return newDate
    })
  }, [])

  const goToNextWeek = useCallback(() => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setDate(newDate.getDate() + 7)
      return newDate
    })
  }, [])

  const weekDays = getWeekDays(currentDate)

  const getEventsForDay = (day: Date): Event[] => {
    return events.filter(event => {
      const eventStart = new Date(event.start_time)
      return (
        eventStart.getDate() === day.getDate() &&
        eventStart.getMonth() === day.getMonth() &&
        eventStart.getFullYear() === day.getFullYear()
      )
    })
  }

  const getEventPosition = (event: Event) => {
    const start = new Date(event.start_time)
    const end = new Date(event.end_time)
    
    const startHour = start.getHours()
    const startMinute = start.getMinutes()
    const endHour = end.getHours()
    const endMinute = end.getMinutes()
    
    // Calculate position (each hour = 64px)
    const top = ((startHour - 6) * 64) + (startMinute / 60 * 64)
    const height = ((endHour - startHour) * 64) + ((endMinute - startMinute) / 60 * 64)
    
    return { top, height: Math.max(height, 32) }
  }

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
  }

  const isToday = (date: Date): boolean => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const formatWeekRange = (): string => {
    const start = weekDays[0]
    const end = weekDays[6]
    return `${start.getDate()}. ${start.toLocaleDateString('de-DE', { month: 'short' })} - ${end.getDate()}. ${end.toLocaleDateString('de-DE', { month: 'short', year: 'numeric' })}`
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: 'rgb(var(--accent))' }} />
      </div>
    )
  }

  return (
    <AppLayout>
      <div className="h-screen flex flex-col" style={{ backgroundColor: 'rgb(var(--bg))' }}>
        {/* Header */}
        <header className="card shadow-none border-b px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold">🗓️ Kalender</h1>
            
            {/* Week Navigation */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={goToPreviousWeek} aria-label="Vorherige Woche">
                ←
              </Button>
              <Button variant="secondary" size="sm" onClick={goToToday}>
                Heute
              </Button>
              <Button variant="ghost" size="sm" onClick={goToNextWeek} aria-label="Nächste Woche">
                →
              </Button>
              <span className="text-sm font-medium text-[rgb(var(--fg-muted))] ml-2">
                {formatWeekRange()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-[rgb(var(--bg-elevated))] border rounded-lg p-1" style={{ borderColor: 'rgb(var(--card-border))' }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setView('week')}
                className={view === 'week' ? 'bg-white dark:bg-gray-700' : ''}
              >
                Woche
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setView('month')}
                className={view === 'month' ? 'bg-white dark:bg-gray-700' : ''}
              >
                Monat
              </Button>
            </div>
          </div>
        </header>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-hidden flex">
          {/* Main Week View */}
          <main className="flex-1 overflow-auto">
            <div className="min-w-[900px]">
              {/* Day Headers */}
              <div className="grid grid-cols-8 border-b sticky top-0 z-10" style={{ 
                backgroundColor: 'rgb(var(--bg))',
                borderColor: 'rgb(var(--card-border))'
              }}>
                <div className="p-4 border-r" style={{ borderColor: 'rgb(var(--card-border))' }}>
                  {/* Time column header */}
                </div>
                {weekDays.map((day, idx) => (
                  <div 
                    key={idx}
                    className={`p-4 text-center border-r ${isToday(day) ? 'bg-accent/10' : ''}`}
                    style={{ borderColor: 'rgb(var(--card-border))' }}
                  >
                    <div className="text-xs text-[rgb(var(--fg-subtle))] uppercase">
                      {DAYS[idx]}
                    </div>
                    <div className={`text-2xl font-bold mt-1 ${isToday(day) ? 'text-[rgb(var(--accent))]' : ''}`}>
                      {day.getDate()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Time Grid */}
              <div className="grid grid-cols-8">
                {/* Time Column */}
                <div className="border-r" style={{ borderColor: 'rgb(var(--card-border))' }}>
                  {HOURS.map(hour => (
                    <div 
                      key={hour}
                      className="h-16 px-2 py-1 text-right border-t"
                      style={{ borderColor: 'rgb(var(--card-border))' }}
                    >
                      <span className="text-xs text-[rgb(var(--fg-subtle))]">
                        {hour}:00
                      </span>
                    </div>
                  ))}
                </div>

                {/* Day Columns */}
                {weekDays.map((day, dayIdx) => (
                  <div 
                    key={dayIdx}
                    className={`relative border-r ${isToday(day) ? 'bg-accent/5' : ''}`}
                    style={{ borderColor: 'rgb(var(--card-border))' }}
                  >
                    {/* Hour Lines */}
                    {HOURS.map(hour => (
                      <div 
                        key={hour}
                        className="h-16 border-t"
                        style={{ borderColor: 'rgb(var(--card-border))' }}
                      />
                    ))}

                    {/* Events */}
                    {getEventsForDay(day).map(event => {
                      if (event.all_day) return null // Handle all-day events separately
                      
                      const { top, height } = getEventPosition(event)
                      
                      return (
                        <div
                          key={event.id}
                          className="absolute left-1 right-1 rounded-lg p-2 cursor-pointer group hover:shadow-lg transition-all"
                          style={{
                            top: `${top}px`,
                            height: `${height}px`,
                            backgroundColor: 'rgba(var(--accent), 0.15)',
                            borderLeft: '4px solid rgb(var(--accent))',
                            zIndex: 5
                          }}
                          onClick={() => router.push('/events')}
                        >
                          <div className="text-sm font-semibold truncate" style={{ color: 'rgb(var(--accent))' }}>
                            {event.title}
                          </div>
                          <div className="text-xs text-[rgb(var(--fg-subtle))] truncate">
                            {formatTime(event.start_time)} - {formatTime(event.end_time)}
                          </div>
                          {event.location && (
                            <div className="text-xs text-[rgb(var(--fg-subtle))] truncate">
                              📍 {event.location}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </main>

          {/* Mini Calendar Sidebar (optional - can be toggled) */}
          <aside className="w-64 border-l p-4 hidden lg:block overflow-auto" style={{ 
            borderColor: 'rgb(var(--card-border))',
            backgroundColor: 'rgb(var(--bg-elevated))'
          }}>
            <h3 className="text-sm font-semibold mb-4 text-[rgb(var(--fg-muted))]">
              NAVIGATION
            </h3>
            
            {/* Quick Stats */}
            <div className="space-y-3 mb-6">
              <div className="card p-3">
                <div className="text-xs text-[rgb(var(--fg-subtle))]">Diese Woche</div>
                <div className="text-2xl font-bold mt-1">
                  {events.filter(e => {
                    const eventDate = new Date(e.start_time)
                    return weekDays.some(d => d.toDateString() === eventDate.toDateString())
                  }).length}
                </div>
                <div className="text-xs text-[rgb(var(--fg-subtle))]">Termine</div>
              </div>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="card p-4">
              <h4 className="text-xs font-semibold mb-3 text-[rgb(var(--fg-subtle))] uppercase">
                Shortcuts
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[rgb(var(--fg-muted))]">Vorherige Woche</span>
                  <kbd className="px-2 py-1 rounded border text-xs" style={{ borderColor: 'rgb(var(--card-border))' }}>←</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-[rgb(var(--fg-muted))]">Nächste Woche</span>
                  <kbd className="px-2 py-1 rounded border text-xs" style={{ borderColor: 'rgb(var(--card-border))' }}>→</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-[rgb(var(--fg-muted))]">Heute</span>
                  <kbd className="px-2 py-1 rounded border text-xs" style={{ borderColor: 'rgb(var(--card-border))' }}>T</kbd>
                </div>
              </div>
            </div>

            {/* Add Event Button */}
            <Button 
              className="w-full mt-4"
              onClick={() => router.push('/events')}
            >
              + Neuer Termin
            </Button>
          </aside>
        </div>
      </div>
    </AppLayout>
  )
}
