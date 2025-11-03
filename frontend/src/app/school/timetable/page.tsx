/**
 * ============================================================================
 * SCHOOL TIMETABLE PAGE - TACTICAL DESIGN
 * ============================================================================
 * 
 * Purpose: Weekly schedule management with time slots
 * Design: Tactical/Military theme with 5-day grid layout
 * 
 * Features:
 * - 📅 Monday-Friday weekly grid view
 * - ⏰ Time slot management (start/end times)
 * - 📚 Subject, teacher, and room information
 * - 🗑️ Delete individual time slots
 * 
 * Search Keywords: #SCHOOL #TIMETABLE #SCHEDULE #WEEK
 * ============================================================================
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// ============================================================================
// COMPONENT IMPORTS - Tactical Design System
// ============================================================================
import AppLayout from '@/components/AppLayout';
import { TacticalStyles, TacticalHelpers } from '@/components/tactical/TacticalStyles';
import { 
  TacticalHeader, 
  TacticalSection, 
  TacticalEmptyState, 
  TacticalButton, 
  TacticalModal 
} from '@/components/tactical/TacticalComponents';

// ============================================================================
// TYPE DEFINITIONS & CONSTANTS
// ============================================================================
interface TimeSlot { 
  id: string; 
  day: number; 
  startTime: string; 
  endTime: string; 
  subject: string; 
  teacher?: string; 
  room?: string; 
}

const DAYS = ['MONTAG', 'DIENSTAG', 'MITTWOCH', 'DONNERSTAG', 'FREITAG', 'SAMSTAG', 'SONNTAG'];

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function SchoolTimetablePage() {
  const router = useRouter();

  // --------------------------------------------------------------------------
  // STATE MANAGEMENT
  // --------------------------------------------------------------------------
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ 
    day: 0, 
    startTime: '', 
    endTime: '', 
    subject: '', 
    teacher: '', 
    room: '' 
  });

  // --------------------------------------------------------------------------
  // LIFECYCLE HOOKS
  // --------------------------------------------------------------------------
  useEffect(() => { 
    fetchData(); 
  }, []);

  // --------------------------------------------------------------------------
  // DATA FETCHING
  // --------------------------------------------------------------------------
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { 
        router.push('/login'); 
        return; 
      }

      const res = await axios.get('/api/school/timetable', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      setSlots(res.data.slots || []);
      setLoading(false);
    } catch (error) {
      console.error('[TIMETABLE] Error fetching data:', error);
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // EVENT HANDLERS - Create
  // --------------------------------------------------------------------------
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/school/timetable', formData, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      setShowModal(false);
      setFormData({ day: 0, startTime: '', endTime: '', subject: '', teacher: '', room: '' });
      fetchData();
    } catch (error) {
      console.error('[TIMETABLE] Error creating slot:', error);
    }
  };

  // --------------------------------------------------------------------------
  // EVENT HANDLERS - Delete
  // --------------------------------------------------------------------------
  const handleDelete = async (id: string) => {
    if (!confirm('Stunde löschen?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/school/timetable/${id}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      fetchData();
    } catch (error) {
      console.error('[TIMETABLE] Error deleting slot:', error);
    }
  };

  // --------------------------------------------------------------------------
  // UTILITY FUNCTIONS
  // --------------------------------------------------------------------------
  const getSlotsForDay = (day: number) => slots.filter(s => s.day === day);

  // --------------------------------------------------------------------------
  // LOADING STATE
  // --------------------------------------------------------------------------
  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: TacticalStyles.colors.bg, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <p style={{ color: TacticalStyles.colors.fgMuted }}>LADE STUNDENPLAN...</p>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // MAIN RENDER
  // --------------------------------------------------------------------------
  return (
    <AppLayout>
      <div style={{ 
        padding: '2rem 1rem', 
        backgroundColor: TacticalStyles.colors.bg, 
        minHeight: 'calc(100vh - 4rem)' 
      }}>
        <div style={{ maxWidth: '90rem', margin: '0 auto' }}>
          
          {/* ================================================================
              HEADER SECTION
              ================================================================ */}
          <TacticalHeader 
            title="STUNDENPLAN" 
            subtitle="WOCHENANSICHT" 
            actions={
              <TacticalButton onClick={() => setShowModal(true)}>
                + STUNDE
              </TacticalButton>
            } 
          />

          {/* ================================================================
              EMPTY STATE
              ================================================================ */}
          {slots.length === 0 ? (
            <TacticalEmptyState 
              icon="📅" 
              title="KEIN STUNDENPLAN" 
              description="Erstelle deinen ersten Stundenplan-Eintrag." 
              actionLabel="+ ERSTE STUNDE" 
              onAction={() => setShowModal(true)} 
            />
          ) : (
            
            /* ================================================================
               WEEKLY GRID VIEW
               ================================================================ */
            <TacticalSection title="DIESE WOCHE" markerColor="accent">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {/* Render Monday - Friday (days 0-4) */}
                {[0, 1, 2, 3, 4].map(day => {
                  const daySlots = getSlotsForDay(day);
                  return (
                    <div 
                      key={day} 
                      style={{ 
                        backgroundColor: TacticalStyles.colors.card, 
                        border: TacticalStyles.borders.default, 
                        borderRadius: '0.5rem', 
                        padding: '1rem', 
                        minHeight: '400px' 
                      }}
                    >
                      {/* Day Header */}
                      <h3 style={{ 
                        fontSize: '1rem', 
                        fontWeight: '700', 
                        color: TacticalStyles.colors.accent, 
                        marginBottom: '1rem', 
                        textAlign: 'center', 
                        borderBottom: TacticalStyles.borders.subtle, 
                        paddingBottom: '0.5rem' 
                      }}>
                        {DAYS[day]}
                      </h3>

                      {/* Time Slots */}
                      <div className="space-y-2">
                        {daySlots.length === 0 ? (
                          <p style={{ 
                            fontSize: '0.75rem', 
                            color: TacticalStyles.colors.fgSubtle, 
                            textAlign: 'center', 
                            marginTop: '2rem' 
                          }}>
                            KEINE STUNDEN
                          </p>
                        ) : (
                          daySlots.map(slot => (
                            <div 
                              key={slot.id} 
                              style={{ 
                                backgroundColor: TacticalStyles.colors.cardHover, 
                                border: TacticalStyles.borders.subtle, 
                                borderRadius: '0.375rem', 
                                padding: '0.75rem' 
                              }}
                            >
                              {/* Subject */}
                              <div style={{ 
                                fontWeight: '700', 
                                fontSize: '0.875rem', 
                                color: TacticalStyles.colors.fg, 
                                marginBottom: '0.25rem' 
                              }}>
                                {slot.subject}
                              </div>

                              {/* Time */}
                              <div style={{ 
                                ...TacticalStyles.typography.bodyMono, 
                                fontSize: '0.75rem', 
                                color: TacticalStyles.colors.fgMuted, 
                                marginBottom: '0.25rem' 
                              }}>
                                {slot.startTime} - {slot.endTime}
                              </div>

                              {/* Teacher */}
                              {slot.teacher && (
                                <div style={{ 
                                  fontSize: '0.75rem', 
                                  color: TacticalStyles.colors.fgSubtle 
                                }}>
                                  👤 {slot.teacher}
                                </div>
                              )}

                              {/* Room */}
                              {slot.room && (
                                <div style={{ 
                                  fontSize: '0.75rem', 
                                  color: TacticalStyles.colors.fgSubtle, 
                                  marginBottom: '0.5rem' 
                                }}>
                                  📍 {slot.room}
                                </div>
                              )}

                              {/* Delete Button */}
                              <TacticalButton 
                                variant="danger" 
                                onClick={() => handleDelete(slot.id)}
                              >
                                DEL
                              </TacticalButton>
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

          {/* ================================================================
              CREATE SLOT MODAL
              ================================================================ */}
          <TacticalModal 
            isOpen={showModal} 
            onClose={() => setShowModal(false)} 
            title="NEUE STUNDE"
          >
            <form onSubmit={handleCreate}>
              {/* Day Selection */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={TacticalHelpers.getLabelStyles()}>TAG *</label>
                <select 
                  value={formData.day} 
                  onChange={(e) => setFormData({ ...formData, day: parseInt(e.target.value) })} 
                  required 
                  style={TacticalHelpers.getInputStyles()}
                >
                  {DAYS.slice(0, 5).map((day, idx) => (
                    <option key={idx} value={idx}>{day}</option>
                  ))}
                </select>
              </div>

              {/* Time Range */}
              <div className="grid grid-cols-2 gap-4" style={{ marginBottom: '1rem' }}>
                <div>
                  <label style={TacticalHelpers.getLabelStyles()}>START *</label>
                  <input 
                    type="time" 
                    value={formData.startTime} 
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} 
                    required 
                    style={TacticalHelpers.getInputStyles()} 
                  />
                </div>
                <div>
                  <label style={TacticalHelpers.getLabelStyles()}>ENDE *</label>
                  <input 
                    type="time" 
                    value={formData.endTime} 
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} 
                    required 
                    style={TacticalHelpers.getInputStyles()} 
                  />
                </div>
              </div>

              {/* Subject */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={TacticalHelpers.getLabelStyles()}>FACH *</label>
                <input 
                  type="text" 
                  value={formData.subject} 
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })} 
                  required 
                  style={TacticalHelpers.getInputStyles()} 
                />
              </div>

              {/* Teacher (Optional) */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={TacticalHelpers.getLabelStyles()}>LEHRER</label>
                <input 
                  type="text" 
                  value={formData.teacher} 
                  onChange={(e) => setFormData({ ...formData, teacher: e.target.value })} 
                  style={TacticalHelpers.getInputStyles()} 
                />
              </div>

              {/* Room (Optional) */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={TacticalHelpers.getLabelStyles()}>RAUM</label>
                <input 
                  type="text" 
                  value={formData.room} 
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })} 
                  style={TacticalHelpers.getInputStyles()} 
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2">
                <TacticalButton 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setShowModal(false)}
                >
                  ABBRECHEN
                </TacticalButton>
                <TacticalButton type="submit">ERSTELLEN</TacticalButton>
              </div>
            </form>
          </TacticalModal>
        </div>
      </div>
    </AppLayout>
  );
}
