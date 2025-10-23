/**
 * Events Page - Terminverwaltung
 */

'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import AppLayout from '@/components/AppLayout'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import { Card } from '@/components/ui/Card'
import Switch from '@/components/ui/Switch'

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

export default function EventsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'upcoming'>('upcoming')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    startTime: '',
    endTime: '',
    allDay: false,
    notes: ''
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchEvents()
    }
  }, [user])

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get(`/api/events`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setEvents(res.data.events)
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const eventData = {
        ...formData,
        startTime: formData.allDay 
          ? `${formData.startTime}T00:00:00.000Z`
          : new Date(formData.startTime).toISOString(),
        endTime: formData.allDay
          ? `${formData.endTime}T23:59:59.999Z`
          : new Date(formData.endTime).toISOString()
      }

      if (editingEvent) {
        await axios.put(
          `/api/events/${editingEvent.id}`,
          eventData,
          { headers: { Authorization: `Bearer ${token}` } }
        )
      } else {
        await axios.post(
          `/api/events`,
          eventData,
          { headers: { Authorization: `Bearer ${token}` } }
        )
      }

      setShowModal(false)
      setEditingEvent(null)
      resetForm()
      fetchEvents()
    } catch (error) {
      console.error('Failed to save event:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Termin wirklich löschen?')) return

    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchEvents()
    } catch (error) {
      console.error('Failed to delete event:', error)
    }
  }

  const openCreateModal = () => {
    setEditingEvent(null)
    resetForm()
    setShowModal(true)
  }

  const openEditModal = (event: Event) => {
    setEditingEvent(event)
    const startDate = new Date(event.start_time)
    const endDate = new Date(event.end_time)
    
    setFormData({
      title: event.title,
      description: event.description || '',
      location: event.location || '',
      startTime: event.all_day 
        ? startDate.toISOString().split('T')[0]
        : startDate.toISOString().slice(0, 16),
      endTime: event.all_day
        ? endDate.toISOString().split('T')[0]
        : endDate.toISOString().slice(0, 16),
      allDay: event.all_day,
      notes: event.notes || ''
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      startTime: '',
      endTime: '',
      allDay: false,
      notes: ''
    })
  }

  const getUpcomingEvents = () => {
    const now = new Date()
    return events
      .filter(event => new Date(event.start_time) >= now)
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
  }

  const getPastEvents = () => {
    const now = new Date()
    return events
      .filter(event => new Date(event.end_time) < now)
      .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
  }

  const formatDateTime = (dateString: string, allDay: boolean) => {
    const date = new Date(dateString)
    if (allDay) {
      return date.toLocaleDateString('de-DE', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      })
    }
    return date.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[rgb(var(--bg))]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: 'rgb(var(--accent-600))' }} />
      </div>
    )
  }

  const displayEvents = viewMode === 'upcoming' ? getUpcomingEvents() : getPastEvents()

  return (
    <AppLayout>
    <div className="bg-[rgb(var(--bg))]">
      {/* Header */}
      <header className="card shadow-none border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">📅 Termine</h1>
            <div className="flex gap-2 items-center">
              <div className="flex bg-[rgb(var(--bg-elevated))] border rounded-lg p-1" style={{ borderColor: 'rgb(var(--card-border))' }} role="tablist" aria-label="Ansicht">
                <Button
                  variant="secondary"
                  size="sm"
                  aria-selected={viewMode === 'upcoming'}
                  aria-controls="events-upcoming"
                  onClick={() => setViewMode('upcoming')}
                  style={{
                    backgroundColor: viewMode === 'upcoming' ? 'rgb(var(--accent))' : 'transparent',
                    color: viewMode === 'upcoming' ? 'white' : 'rgb(var(--fg-muted))',
                    fontWeight: viewMode === 'upcoming' ? '600' : '500'
                  }}
                >
                  Anstehend
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  aria-selected={viewMode === 'list'}
                  aria-controls="events-list"
                  onClick={() => setViewMode('list')}
                  style={{
                    backgroundColor: viewMode === 'list' ? 'rgb(var(--accent))' : 'transparent',
                    color: viewMode === 'list' ? 'white' : 'rgb(var(--fg-muted))',
                    fontWeight: viewMode === 'list' ? '600' : '500'
                  }}
                >
                  Vergangene
                </Button>
              </div>
              <Button onClick={openCreateModal}>+ Neuer Termin</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Events List */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {displayEvents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[rgb(var(--fg-subtle))] text-lg">
              {viewMode === 'upcoming' ? 'Keine anstehenden Termine' : 'Keine vergangenen Termine'}
            </p>
          </div>
        ) : (
          <div className="space-y-4" id={viewMode === 'upcoming' ? 'events-upcoming' : 'events-list'} role="region" aria-live="polite">
            {displayEvents.map((event) => (
              <Card key={event.id} className="p-6 hover:shadow transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">
                      {event.title}
                    </h3>
                    {event.description && (
                      <p className="text-[rgb(var(--fg-muted))] mb-3">
                        {event.description}
                      </p>
                    )}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-[rgb(var(--fg-muted))]">
                        <span className="font-medium">🕐 Start:</span>
                        {formatDateTime(event.start_time, event.all_day)}
                      </div>
                      <div className="flex items-center gap-2 text-[rgb(var(--fg-muted))]">
                        <span className="font-medium">🕐 Ende:</span>
                        {formatDateTime(event.end_time, event.all_day)}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2 text-[rgb(var(--fg-muted))]">
                          <span className="font-medium">📍 Ort:</span>
                          {event.location}
                        </div>
                      )}
                      {event.notes && (
                        <div className="flex items-start gap-2 text-[rgb(var(--fg-muted))] mt-3">
                          <span className="font-medium">📝 Notizen:</span>
                          <span className="flex-1">{event.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="secondary" size="sm" onClick={() => openEditModal(event)} aria-label="Termin bearbeiten">✏️</Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(event.id)} aria-label="Termin löschen">🗑️</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="event-modal-title">
            <h2 id="event-modal-title" className="text-xl font-bold mb-4">
              {editingEvent ? 'Termin bearbeiten' : 'Neuer Termin'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Titel *</label>
                  <Input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Beschreibung</label>
                  <Textarea rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>

                <div>
                  <Switch label="Ganztägig" checked={formData.allDay} onChange={(e) => setFormData({ ...formData, allDay: (e.target as any).checked })} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start *</label>
                    <Input
                      type={formData.allDay ? 'date' : 'datetime-local'}
                      required
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Ende *</label>
                    <Input
                      type={formData.allDay ? 'date' : 'datetime-local'}
                      required
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Ort</label>
                  <Input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Notizen</label>
                  <Textarea rows={3} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => { setShowModal(false); setEditingEvent(null); }}
                >
                  Abbrechen
                </Button>
                <Button type="submit" className="flex-1">
                  {editingEvent ? 'Speichern' : 'Erstellen'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </AppLayout>
  )
}
