/**
 * Todos Page - Kanban Board
 */

'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import AppLayout from '@/components/AppLayout'
import Button from '@/components/ui/Button'

interface Todo {
  id: string
  user_id: string
  title: string
  description?: string
  status: 'OPEN' | 'IN_PROGRESS' | 'DONE'
  priority: number
  due_date?: string
  order: number
  created_at: string
  updated_at: string
}

type TodoStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE'

const STATUS_LABELS = {
  OPEN: 'Offen',
  IN_PROGRESS: 'In Bearbeitung',
  DONE: 'Fertig'
}

const PRIORITY_COLORS = {
  1: 'bg-blue-100 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700',
  2: 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700',
  3: 'bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-700'
}

export default function TodosPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 1,
    dueDate: ''
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchTodos()
    }
  }, [user])

  const fetchTodos = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get(`/api/todos`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTodos(res.data.todos)
    } catch (error) {
      console.error('Failed to fetch todos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `/api/todos`,
        {
          ...formData,
          dueDate: formData.dueDate || null
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      setShowModal(false)
      setFormData({ title: '', description: '', priority: 1, dueDate: '' })
      fetchTodos()
    } catch (error) {
      console.error('Failed to create todo:', error)
    }
  }

  const handleUpdateTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTodo) return

    try {
      const token = localStorage.getItem('token')
      await axios.put(
        `/api/todos/${editingTodo.id}`,
        {
          ...formData,
          dueDate: formData.dueDate || null
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      setShowModal(false)
      setEditingTodo(null)
      setFormData({ title: '', description: '', priority: 1, dueDate: '' })
      fetchTodos()
    } catch (error) {
      console.error('Failed to update todo:', error)
    }
  }

  const handleDeleteTodo = async (id: string) => {
    if (!confirm('Todo wirklich löschen?')) return

    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/todos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchTodos()
    } catch (error) {
      console.error('Failed to delete todo:', error)
    }
  }

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result

    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    const newStatus = destination.droppableId as TodoStatus

    try {
      const token = localStorage.getItem('token')
      await axios.patch(
        `/api/todos/${draggableId}/move`,
        {
          status: newStatus,
          order: destination.index
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      fetchTodos()
    } catch (error) {
      console.error('Failed to move todo:', error)
    }
  }

  const openCreateModal = () => {
    setEditingTodo(null)
    setFormData({ title: '', description: '', priority: 1, dueDate: '' })
    setShowModal(true)
  }

  const openEditModal = (todo: Todo) => {
    setEditingTodo(todo)
    setFormData({
      title: todo.title,
      description: todo.description || '',
      priority: todo.priority,
      dueDate: todo.due_date ? todo.due_date.split('T')[0] : ''
    })
    setShowModal(true)
  }

  const getTodosByStatus = (status: TodoStatus) => {
    return todos
      .filter((todo) => todo.status === status)
      .sort((a, b) => a.order - b.order)
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <AppLayout>
    <div>
      {/* Header */}
      <header className="card shadow-none border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">
              ✅ Todos - Kanban Board
            </h1>
          </div>
          <Button onClick={openCreateModal}>+ Neues Todo</Button>
        </div>
      </header>

      {/* Kanban Board */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(['OPEN', 'IN_PROGRESS', 'DONE'] as TodoStatus[]).map((status) => (
              <div key={status} className="card p-4">
                <h2 className="text-lg font-semibold mb-4">
                  {STATUS_LABELS[status]}
                  <span className="ml-2 text-sm text-[rgb(var(--fg-subtle))]">
                    ({getTodosByStatus(status).length})
                  </span>
                </h2>

                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-3 min-h-[200px] ${
                        snapshot.isDraggingOver ? 'bg-[rgb(var(--bg-elevated))]' : ''
                      } rounded-lg p-2 transition-colors`}
                    >
                      {getTodosByStatus(status).map((todo, index) => (
                        <Draggable key={todo.id} draggableId={todo.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`card p-4 border-2 ${
                                PRIORITY_COLORS[todo.priority as 1 | 2 | 3]
                              } ${
                                snapshot.isDragging ? 'opacity-50 rotate-2' : ''
                              } transition-all cursor-move`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold">
                                  {todo.title}
                                </h3>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => openEditModal(todo)}
                                    className="btn btn-secondary px-2 py-1 text-xs"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTodo(todo.id)}
                                    className="btn btn-danger px-2 py-1 text-xs"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                              {todo.description && (
                                <p className="text-sm text-[rgb(var(--fg-muted))] mb-2">
                                  {todo.description}
                                </p>
                              )}
                              {todo.due_date && (
                                <p className="text-xs text-[rgb(var(--fg-subtle))]">
                                  📅 {new Date(todo.due_date).toLocaleDateString('de-DE')}
                                </p>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {editingTodo ? 'Todo bearbeiten' : 'Neues Todo'}
            </h2>
            <form onSubmit={editingTodo ? handleUpdateTodo : handleCreateTodo}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Titel *
                  </label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Beschreibung
                  </label>
                  <textarea
                    rows={3}
                    className="textarea"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Priorität
                  </label>
                  <select
                    className="select"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                  >
                    <option value={1}>Niedrig</option>
                    <option value={2}>Mittel</option>
                    <option value={3}>Hoch</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fälligkeitsdatum
                  </label>
                  <input
                    type="date"
                    className="input"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingTodo(null)
                  }}
                  className="flex-1 btn btn-secondary"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="flex-1 btn btn-primary"
                >
                  {editingTodo ? 'Speichern' : 'Erstellen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </AppLayout>
  )
}
