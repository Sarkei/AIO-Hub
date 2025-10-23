'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import AppLayout from '@/components/AppLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function SchoolTodosPage() {
  const router = useRouter();
  const [todos, setTodos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTodos = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await axios.get('http://localhost:4000/api/school/todos', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTodos(res.data.todos);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'DONE' ? 'OPEN' : 'DONE';
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:4000/api/school/todos/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTodos();
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  if (loading) {
    return <AppLayout><div className="flex items-center justify-center h-full"><div className="text-lg" style={{ color: 'rgb(var(--fg-muted))' }}>Lädt...</div></div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'rgb(var(--fg))' }}>
            ✅ Schul-Aufgaben
          </h1>
          <p style={{ color: 'rgb(var(--fg-muted))' }}>
            Hausaufgaben, Projekte und Prüfungsvorbereitung
          </p>
        </div>

        {todos.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-lg mb-2" style={{ color: 'rgb(var(--fg))' }}>Keine Aufgaben vorhanden</p>
              <p style={{ color: 'rgb(var(--fg-muted))' }}>Erstelle dein erstes Schuljahr, um Aufgaben zu verwalten</p>
              <Button className="mt-4" onClick={() => router.push('/school/overview')}>Schuljahr erstellen</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {todos.map((todo) => (
              <Card key={todo.id} style={{ opacity: todo.status === 'DONE' ? 0.6 : 1 }}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleStatus(todo.id, todo.status)}
                      className="mt-1"
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: `2px solid ${todo.status === 'DONE' ? 'rgb(var(--success))' : 'rgb(var(--card-border))'}`,
                        backgroundColor: todo.status === 'DONE' ? 'rgb(var(--success))' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '14px'
                      }}
                    >
                      {todo.status === 'DONE' && '✓'}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-xs px-2 py-1 rounded inline-block mb-1" style={{ backgroundColor: 'rgba(var(--accent), 0.1)', color: 'rgb(var(--accent))' }}>
                            {todo.subject}
                          </div>
                          <h3 className="font-bold mb-1" style={{ color: 'rgb(var(--fg))', textDecoration: todo.status === 'DONE' ? 'line-through' : 'none' }}>
                            {todo.title}
                          </h3>
                          {todo.description && (
                            <p className="text-sm mb-2" style={{ color: 'rgb(var(--fg-muted))' }}>
                              {todo.description}
                            </p>
                          )}
                        </div>
                        {todo.due_date && (
                          <div className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'rgb(var(--bg-base))', color: 'rgb(var(--fg-muted))' }}>
                            📅 {new Date(todo.due_date).toLocaleDateString('de-DE')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
