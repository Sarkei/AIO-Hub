'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import AppLayout from '@/components/AppLayout';
import { TacticalStyles, TacticalHelpers } from '@/components/tactical/TacticalStyles';
import { TacticalHeader, TacticalSection, TacticalEmptyState, TacticalButton, TacticalModal } from '@/components/tactical/TacticalComponents';

interface Event {
  id: string;
  title: string;
  description?: string;
  location?: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  notes?: string;
}

export default function CalendarPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', location: '', startTime: '', endTime: '', allDay: false, notes: '' });

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  const fetchEvents = useCallback(async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/events', { headers: { Authorization: `Bearer ${token}` } });
      setEvents(res.data.events || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/events', { ...formData, startTime: formData.startTime, endTime: formData.endTime }, { headers: { Authorization: `Bearer ${token}` } });
      setShowModal(false);
      setFormData({ title: '', description: '', location: '', startTime: '', endTime: '', allDay: false, notes: '' });
      fetchEvents();
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Event löschen?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/events/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchEvents();
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  const getEventsForDate = (date: Date) => {
    return events.filter((e) => {
      const eventDate = new Date(e.start_time);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getWeekDays = (date: Date): Date[] => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  if (loading || authLoading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: TacticalStyles.colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: TacticalStyles.colors.fgMuted }}>LADE KALENDER...</p>
      </div>
    );
  }

  const weekDays = getWeekDays(currentDate);

  return (
    <AppLayout>
      <div style={{ padding: '2rem 1rem', backgroundColor: TacticalStyles.colors.bg, minHeight: 'calc(100vh - 4rem)' }}>
        <div style={{ maxWidth: '90rem', margin: '0 auto' }}>
          <TacticalHeader
            title="KALENDER"
            subtitle="WOCHENANSICHT"
            actions={
              <div className="flex gap-2">
                <TacticalButton variant="secondary" onClick={() => { const d = new Date(); setCurrentDate(d); }}>HEUTE</TacticalButton>
                <TacticalButton variant="secondary" onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate() - 7); setCurrentDate(d); }}>← ZURÜCK</TacticalButton>
                <TacticalButton variant="secondary" onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate() + 7); setCurrentDate(d); }}>VOR →</TacticalButton>
                <TacticalButton onClick={() => { setFormData({ title: '', description: '', location: '', startTime: '', endTime: '', allDay: false, notes: '' }); setShowModal(true); }}>+ EVENT</TacticalButton>
              </div>
            }
          />

          {events.length === 0 ? (
            <TacticalEmptyState icon="📅" title="KEINE EVENTS" description="Erstelle deinen ersten Kalendereintrag." actionLabel="+ ERSTEN EVENT ERSTELLEN" onAction={() => setShowModal(true)} />
          ) : (
            <TacticalSection title={`KW ${Math.ceil((currentDate.getDate() + new Date(currentDate.getFullYear(), 0, 1).getDay()) / 7)}`} markerColor="accent">
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day, idx) => {
                  const dayEvents = getEventsForDate(day);
                  const isToday = day.toDateString() === new Date().toDateString();
                  return (
                    <div key={idx} style={{ backgroundColor: TacticalStyles.colors.card, border: isToday ? `2px solid ${TacticalStyles.colors.accent}` : TacticalStyles.borders.default, borderRadius: '0.5rem', padding: '1rem', minHeight: '400px' }}>
                      <div style={{ textAlign: 'center', marginBottom: '1rem', borderBottom: TacticalStyles.borders.subtle, paddingBottom: '0.5rem' }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: '700', color: isToday ? TacticalStyles.colors.accent : TacticalStyles.colors.fgMuted }}>
                          {['MO', 'DI', 'MI', 'DO', 'FR', 'SA', 'SO'][idx]}
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '900', color: isToday ? TacticalStyles.colors.accent : TacticalStyles.colors.fg }}>
                          {day.getDate()}
                        </div>
                      </div>
                      <div className="space-y-2">
                        {dayEvents.length === 0 ? (
                          <p style={{ fontSize: '0.75rem', color: TacticalStyles.colors.fgSubtle, textAlign: 'center', marginTop: '2rem' }}>KEINE EVENTS</p>
                        ) : (
                          dayEvents.map((event) => (
                            <div key={event.id} style={{ backgroundColor: TacticalStyles.colors.cardHover, border: TacticalStyles.borders.subtle, borderRadius: '0.375rem', padding: '0.75rem' }}>
                              <div style={{ fontWeight: '700', fontSize: '0.875rem', color: TacticalStyles.colors.fg, marginBottom: '0.25rem' }}>{event.title}</div>
                              <div style={{ ...TacticalStyles.typography.bodyMono, fontSize: '0.75rem', color: TacticalStyles.colors.fgMuted, marginBottom: '0.5rem' }}>
                                {new Date(event.start_time).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} - {new Date(event.end_time).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                              {event.location && <div style={{ fontSize: '0.75rem', color: TacticalStyles.colors.fgSubtle, marginBottom: '0.5rem' }}>📍 {event.location}</div>}
                              <TacticalButton variant="danger" onClick={() => handleDeleteEvent(event.id)}>DEL</TacticalButton>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </TacticalSection>
          )}

          <TacticalModal isOpen={showModal} onClose={() => setShowModal(false)} title="NEUER EVENT">
            <form onSubmit={handleCreateEvent}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={TacticalHelpers.getLabelStyles()}>TITEL *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required style={TacticalHelpers.getInputStyles()} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={TacticalHelpers.getLabelStyles()}>BESCHREIBUNG</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} style={{ ...TacticalHelpers.getInputStyles(), resize: 'vertical', minHeight: '60px' }} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={TacticalHelpers.getLabelStyles()}>ORT</label>
                <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} style={TacticalHelpers.getInputStyles()} />
              </div>
              <div className="grid grid-cols-2 gap-4" style={{ marginBottom: '1rem' }}>
                <div>
                  <label style={TacticalHelpers.getLabelStyles()}>START *</label>
                  <input type="datetime-local" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} required style={TacticalHelpers.getInputStyles()} />
                </div>
                <div>
                  <label style={TacticalHelpers.getLabelStyles()}>ENDE *</label>
                  <input type="datetime-local" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} required style={TacticalHelpers.getInputStyles()} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <TacticalButton type="button" variant="secondary" onClick={() => setShowModal(false)}>ABBRECHEN</TacticalButton>
                <TacticalButton type="submit">ERSTELLEN</TacticalButton>
              </div>
            </form>
          </TacticalModal>
        </div>
      </div>
    </AppLayout>
  );
}
