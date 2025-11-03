/**
 * ============================================================================
 * SCHOOL TODOS PAGE - TACTICAL DESIGN
 * ============================================================================
 * 
 * Purpose: School-specific task and homework management
 * Design: Tactical/Military theme with priority-based color coding
 * 
 * Features:
 * - ✅ Task completion tracking (open/completed separation)
 * - 🎯 Priority levels (Low/Medium/High) with color indicators
 * - 📚 Subject assignment for organization
 * - 📅 Due date tracking
 * - 📝 Task descriptions and notes
 * 
 * Priority Colors:
 * - Low (1): Forest green
 * - Medium (2): Warning yellow
 * - High (3): Danger red
 * 
 * Search Keywords: #SCHOOL #TODOS #TASKS #HOMEWORK #PRIORITY
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
// TYPE DEFINITIONS
// ============================================================================
interface SchoolTodo { 
  id: string; 
  title: string; 
  description?: string; 
  subject?: string; 
  dueDate?: string; 
  completed: boolean; 
  priority: number; 
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function SchoolTodosPage() {
  const router = useRouter();

  // --------------------------------------------------------------------------
  // STATE MANAGEMENT
  // --------------------------------------------------------------------------
  const [todos, setTodos] = useState<SchoolTodo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    subject: '', 
    dueDate: '', 
    priority: 1 
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

      const res = await axios.get('/api/school/todos', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      setTodos(res.data.todos || []);
      setLoading(false);
    } catch (error) {
      console.error('[SCHOOL-TODOS] Error fetching data:', error);
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
      await axios.post('/api/school/todos', 
        { ...formData, dueDate: formData.dueDate || null }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setShowModal(false);
      setFormData({ title: '', description: '', subject: '', dueDate: '', priority: 1 });
      fetchData();
    } catch (error) {
      console.error('[SCHOOL-TODOS] Error creating todo:', error);
    }
  };

  // --------------------------------------------------------------------------
  // EVENT HANDLERS - Toggle Completion
  // --------------------------------------------------------------------------
  const handleToggle = async (id: string, completed: boolean) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/school/todos/${id}`, 
        { completed: !completed }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
    } catch (error) {
      console.error('[SCHOOL-TODOS] Error toggling todo:', error);
    }
  };

  // --------------------------------------------------------------------------
  // EVENT HANDLERS - Delete
  // --------------------------------------------------------------------------
  const handleDelete = async (id: string) => {
    if (!confirm('Todo löschen?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/school/todos/${id}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      fetchData();
    } catch (error) {
      console.error('[SCHOOL-TODOS] Error deleting todo:', error);
    }
  };

  // --------------------------------------------------------------------------
  // DATA FILTERING
  // --------------------------------------------------------------------------
  const openTodos = todos.filter(t => !t.completed);
  const completedTodos = todos.filter(t => t.completed);

  // --------------------------------------------------------------------------
  // STYLING - Priority Color Mapping
  // --------------------------------------------------------------------------
  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return TacticalStyles.colors.forest;   // Low: green
      case 2: return TacticalStyles.colors.warning;  // Medium: yellow
      case 3: return TacticalStyles.colors.danger;   // High: red
      default: return TacticalStyles.colors.fgMuted;
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return 'NIEDRIG';
      case 2: return 'MITTEL';
      case 3: return 'HOCH';
      default: return 'NIEDRIG';
    }
  };

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
        <p style={{ color: TacticalStyles.colors.fgMuted }}>LADE SCHOOL TODOS...</p>
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
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          
          {/* ================================================================
              HEADER SECTION
              ================================================================ */}
          <TacticalHeader 
            title="SCHOOL TODOS" 
            subtitle="AUFGABEN & HAUSAUFGABEN" 
            actions={
              <TacticalButton onClick={() => setShowModal(true)}>
                + TODO
              </TacticalButton>
            } 
          />

          {/* ================================================================
              EMPTY STATE
              ================================================================ */}
          {todos.length === 0 ? (
            <TacticalEmptyState 
              icon="✅" 
              title="KEINE TODOS" 
              description="Erstelle dein erstes School-Todo." 
              actionLabel="+ ERSTES TODO" 
              onAction={() => setShowModal(true)} 
            />
          ) : (
            <>
              {/* ============================================================
                  OPEN TODOS SECTION
                  ============================================================ */}
              <TacticalSection title={`OFFEN (${openTodos.length})`} markerColor="accent">
                {openTodos.length === 0 ? (
                  <p style={{ 
                    textAlign: 'center', 
                    padding: '2rem', 
                    color: TacticalStyles.colors.fgSubtle 
                  }}>
                    KEINE OFFENEN TODOS
                  </p>
                ) : (
                  <div className="space-y-3">
                    {openTodos.map(todo => (
                      <div 
                        key={todo.id} 
                        style={{ 
                          backgroundColor: TacticalStyles.colors.card, 
                          border: TacticalStyles.borders.default, 
                          borderRadius: '0.5rem', 
                          padding: '1.5rem' 
                        }}
                      >
                        <div className="flex justify-between items-start">
                          {/* Checkbox and Content */}
                          <div className="flex items-start gap-3 flex-1">
                            <input 
                              type="checkbox" 
                              checked={todo.completed} 
                              onChange={() => handleToggle(todo.id, todo.completed)} 
                              style={{ 
                                marginTop: '0.25rem', 
                                width: '1.25rem', 
                                height: '1.25rem', 
                                cursor: 'pointer' 
                              }} 
                            />
                            
                            <div className="flex-1">
                              {/* Title */}
                              <div style={{ 
                                fontWeight: '700', 
                                fontSize: '1.125rem', 
                                color: TacticalStyles.colors.fg, 
                                marginBottom: '0.5rem' 
                              }}>
                                {todo.title}
                              </div>

                              {/* Description */}
                              {todo.description && (
                                <p style={{ 
                                  fontSize: '0.875rem', 
                                  color: TacticalStyles.colors.fgMuted, 
                                  marginBottom: '0.75rem' 
                                }}>
                                  {todo.description}
                                </p>
                              )}

                              {/* Metadata: Subject, Due Date, Priority */}
                              <div className="flex gap-3 flex-wrap">
                                {/* Subject Badge */}
                                {todo.subject && (
                                  <span style={{ 
                                    fontSize: '0.75rem', 
                                    fontWeight: '700', 
                                    color: TacticalStyles.colors.accent, 
                                    padding: '0.25rem 0.5rem', 
                                    border: `1px solid ${TacticalStyles.colors.accent}`, 
                                    borderRadius: '0.25rem' 
                                  }}>
                                    {todo.subject}
                                  </span>
                                )}

                                {/* Due Date */}
                                {todo.dueDate && (
                                  <span style={{ 
                                    fontSize: '0.75rem', 
                                    color: TacticalStyles.colors.fgSubtle 
                                  }}>
                                    📅 {new Date(todo.dueDate).toLocaleDateString('de-DE')}
                                  </span>
                                )}

                                {/* Priority Badge */}
                                <span style={{ 
                                  fontSize: '0.75rem', 
                                  fontWeight: '700', 
                                  color: getPriorityColor(todo.priority), 
                                  padding: '0.25rem 0.5rem', 
                                  border: `1px solid ${getPriorityColor(todo.priority)}`, 
                                  borderRadius: '0.25rem' 
                                }}>
                                  {getPriorityLabel(todo.priority)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Delete Button */}
                          <TacticalButton 
                            variant="danger" 
                            onClick={() => handleDelete(todo.id)}
                          >
                            DEL
                          </TacticalButton>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TacticalSection>

              {/* ============================================================
                  COMPLETED TODOS SECTION
                  ============================================================ */}
              {completedTodos.length > 0 && (
                <TacticalSection title={`ERLEDIGT (${completedTodos.length})`} markerColor="forest">
                  <div className="space-y-3">
                    {completedTodos.map(todo => (
                      <div 
                        key={todo.id} 
                        style={{ 
                          backgroundColor: TacticalStyles.colors.card, 
                          border: TacticalStyles.borders.subtle, 
                          borderRadius: '0.5rem', 
                          padding: '1rem', 
                          opacity: 0.7 
                        }}
                      >
                        <div className="flex justify-between items-center">
                          {/* Checkbox and Title */}
                          <div className="flex items-center gap-3 flex-1">
                            <input 
                              type="checkbox" 
                              checked={todo.completed} 
                              onChange={() => handleToggle(todo.id, todo.completed)} 
                              style={{ 
                                width: '1.25rem', 
                                height: '1.25rem', 
                                cursor: 'pointer' 
                              }} 
                            />
                            <div style={{ 
                              fontWeight: '600', 
                              color: TacticalStyles.colors.fgMuted, 
                              textDecoration: 'line-through' 
                            }}>
                              {todo.title}
                            </div>
                          </div>

                          {/* Delete Button */}
                          <TacticalButton 
                            variant="danger" 
                            onClick={() => handleDelete(todo.id)}
                          >
                            DEL
                          </TacticalButton>
                        </div>
                      </div>
                    ))}
                  </div>
                </TacticalSection>
              )}
            </>
          )}

          {/* ================================================================
              CREATE TODO MODAL
              ================================================================ */}
          <TacticalModal 
            isOpen={showModal} 
            onClose={() => setShowModal(false)} 
            title="NEUES TODO"
          >
            <form onSubmit={handleCreate}>
              {/* Title */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={TacticalHelpers.getLabelStyles()}>TITEL *</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                  required 
                  style={TacticalHelpers.getInputStyles()} 
                />
              </div>

              {/* Description */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={TacticalHelpers.getLabelStyles()}>BESCHREIBUNG</label>
                <textarea 
                  value={formData.description} 
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                  rows={3} 
                  style={{ 
                    ...TacticalHelpers.getInputStyles(), 
                    resize: 'vertical', 
                    minHeight: '80px' 
                  }} 
                />
              </div>

              {/* Subject */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={TacticalHelpers.getLabelStyles()}>FACH</label>
                <input 
                  type="text" 
                  value={formData.subject} 
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })} 
                  style={TacticalHelpers.getInputStyles()} 
                />
              </div>

              {/* Due Date */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={TacticalHelpers.getLabelStyles()}>FÄLLIGKEITSDATUM</label>
                <input 
                  type="date" 
                  value={formData.dueDate} 
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} 
                  style={TacticalHelpers.getInputStyles()} 
                />
              </div>

              {/* Priority Selection */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={TacticalHelpers.getLabelStyles()}>PRIORITÄT</label>
                <select 
                  value={formData.priority} 
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })} 
                  style={TacticalHelpers.getInputStyles()}
                >
                  <option value={1}>NIEDRIG</option>
                  <option value={2}>MITTEL</option>
                  <option value={3}>HOCH</option>
                </select>
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
