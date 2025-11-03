'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import AppLayout from '@/components/AppLayout';
import { TacticalStyles, TacticalHelpers } from '@/components/tactical/TacticalStyles';
import { TacticalHeader, TacticalSection, TacticalEmptyState, TacticalButton, TacticalModal } from '@/components/tactical/TacticalComponents';

interface Todo {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'DONE';
  priority: number;
  due_date?: string;
  order: number;
  created_at: string;
}

type TodoStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE';

const STATUS_LABELS = { OPEN: 'OFFEN', IN_PROGRESS: 'IN ARBEIT', DONE: 'FERTIG' };
const STATUS_COLORS = { OPEN: 'accent', IN_PROGRESS: 'warning', DONE: 'forest' };

export default function TodosPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '', priority: 1, dueDate: '' });

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) fetchTodos();
  }, [user]);

  const fetchTodos = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/todos`, { headers: { Authorization: `Bearer ${token}` } });
      setTodos(res.data.todos);
    } catch (error) {
      console.error('Failed to fetch todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/todos`, { ...formData, dueDate: formData.dueDate || null }, { headers: { Authorization: `Bearer ${token}` } });
      setShowModal(false);
      setFormData({ title: '', description: '', priority: 1, dueDate: '' });
      fetchTodos();
    } catch (error) {
      console.error('Failed to create todo:', error);
    }
  };

  const handleUpdateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTodo) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/todos/${editingTodo.id}`, { ...formData, dueDate: formData.dueDate || null }, { headers: { Authorization: `Bearer ${token}` } });
      setShowModal(false);
      setEditingTodo(null);
      setFormData({ title: '', description: '', priority: 1, dueDate: '' });
      fetchTodos();
    } catch (error) {
      console.error('Failed to update todo:', error);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    if (!confirm('Todo löschen?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/todos/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchTodos();
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, draggableId } = result;
    if (!destination) return;
    const newStatus = destination.droppableId as TodoStatus;
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/todos/${draggableId}`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
      fetchTodos();
    } catch (error) {
      console.error('Failed to update todo status:', error);
    }
  };

  const getTodosByStatus = (status: TodoStatus) => todos.filter((t) => t.status === status).sort((a, b) => a.order - b.order);

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return 'NIEDRIG';
      case 2: return 'MITTEL';
      case 3: return 'HOCH';
      default: return 'NIEDRIG';
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return TacticalStyles.colors.forest;
      case 2: return TacticalStyles.colors.warning;
      case 3: return TacticalStyles.colors.danger;
      default: return TacticalStyles.colors.fgMuted;
    }
  };

  if (loading || authLoading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: TacticalStyles.colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: TacticalStyles.colors.fgMuted }}>LADE TODOS...</p>
      </div>
    );
  }

  return (
    <AppLayout>
      <div style={{ padding: '2rem 1rem', backgroundColor: TacticalStyles.colors.bg, minHeight: 'calc(100vh - 4rem)' }}>
        <div style={{ maxWidth: '90rem', margin: '0 auto' }}>
          <TacticalHeader
            title="TASK MANAGER"
            subtitle="KANBAN BOARD"
            actions={
              <TacticalButton onClick={() => { setEditingTodo(null); setFormData({ title: '', description: '', priority: 1, dueDate: '' }); setShowModal(true); }}>+ TASK</TacticalButton>
            }
          />

          {todos.length === 0 ? (
            <TacticalEmptyState icon="✅" title="KEINE TASKS" description="Erstelle deinen ersten Task und verwalte deine Aufgaben im Kanban-Style." actionLabel="+ ERSTEN TASK ERSTELLEN" onAction={() => setShowModal(true)} />
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['OPEN', 'IN_PROGRESS', 'DONE'] as TodoStatus[]).map((status) => {
                  const statusTodos = getTodosByStatus(status);
                  const borderColor = STATUS_COLORS[status];
                  return (
                    <Droppable key={status} droppableId={status}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          style={{
                            backgroundColor: snapshot.isDraggingOver ? TacticalStyles.colors.cardHover : TacticalStyles.colors.card,
                            border: `2px solid ${borderColor === 'accent' ? TacticalStyles.colors.accent : borderColor === 'warning' ? TacticalStyles.colors.warning : TacticalStyles.colors.forest}`,
                            borderRadius: '0.5rem',
                            padding: '1rem',
                            minHeight: '500px',
                          }}
                        >
                          <h2 style={{ fontSize: '1.125rem', fontWeight: '700', color: borderColor === 'accent' ? TacticalStyles.colors.accent : borderColor === 'warning' ? TacticalStyles.colors.warning : TacticalStyles.colors.forest, marginBottom: '1rem', textTransform: 'uppercase' }}>
                            {STATUS_LABELS[status]} ({statusTodos.length})
                          </h2>
                          <div className="space-y-3">
                            {statusTodos.map((todo, index) => (
                              <Draggable key={todo.id} draggableId={todo.id} index={index}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={{
                                      ...provided.draggableProps.style,
                                      backgroundColor: TacticalStyles.colors.cardHover,
                                      border: TacticalStyles.borders.default,
                                      borderRadius: '0.375rem',
                                      padding: '1rem',
                                      cursor: 'grab',
                                    }}
                                  >
                                    <div className="flex justify-between items-start mb-2">
                                      <div style={{ fontWeight: '700', color: TacticalStyles.colors.fg }}>{todo.title}</div>
                                      <div style={{ fontSize: '0.75rem', fontWeight: '700', color: getPriorityColor(todo.priority), padding: '0.125rem 0.5rem', border: `1px solid ${getPriorityColor(todo.priority)}`, borderRadius: '0.25rem' }}>
                                        {getPriorityLabel(todo.priority)}
                                      </div>
                                    </div>
                                    {todo.description && (
                                      <p style={{ fontSize: '0.875rem', color: TacticalStyles.colors.fgMuted, marginBottom: '0.75rem' }}>{todo.description}</p>
                                    )}
                                    {todo.due_date && (
                                      <p style={{ ...TacticalStyles.typography.bodyMono, fontSize: '0.75rem', color: TacticalStyles.colors.fgSubtle, marginBottom: '0.75rem' }}>
                                        📅 {new Date(todo.due_date).toLocaleDateString('de-DE')}
                                      </p>
                                    )}
                                    <div className="flex gap-2">
                                      <TacticalButton onClick={() => { setEditingTodo(todo); setFormData({ title: todo.title, description: todo.description || '', priority: todo.priority, dueDate: todo.due_date || '' }); setShowModal(true); }}>EDIT</TacticalButton>
                                      <TacticalButton variant="danger" onClick={() => handleDeleteTodo(todo.id)}>DEL</TacticalButton>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                          </div>
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  );
                })}
              </div>
            </DragDropContext>
          )}

          <TacticalModal isOpen={showModal} onClose={() => { setShowModal(false); setEditingTodo(null); }} title={editingTodo ? 'TASK BEARBEITEN' : 'NEUER TASK'}>
            <form onSubmit={editingTodo ? handleUpdateTodo : handleCreateTodo}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={TacticalHelpers.getLabelStyles()}>TITEL *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required style={TacticalHelpers.getInputStyles()} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={TacticalHelpers.getLabelStyles()}>BESCHREIBUNG</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} style={{ ...TacticalHelpers.getInputStyles(), resize: 'vertical', minHeight: '80px' }} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={TacticalHelpers.getLabelStyles()}>PRIORITÄT</label>
                <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })} style={TacticalHelpers.getInputStyles()}>
                  <option value={1}>NIEDRIG</option>
                  <option value={2}>MITTEL</option>
                  <option value={3}>HOCH</option>
                </select>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={TacticalHelpers.getLabelStyles()}>FÄLLIGKEITSDATUM</label>
                <input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} style={TacticalHelpers.getInputStyles()} />
              </div>
              <div className="flex justify-end gap-2">
                <TacticalButton type="button" variant="secondary" onClick={() => { setShowModal(false); setEditingTodo(null); }}>ABBRECHEN</TacticalButton>
                <TacticalButton type="submit">{editingTodo ? 'UPDATE' : 'ERSTELLEN'}</TacticalButton>
              </div>
            </form>
          </TacticalModal>
        </div>
      </div>
    </AppLayout>
  );
}
