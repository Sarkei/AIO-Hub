'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import AppLayout from '@/components/AppLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function NotesPage() {
  const router = useRouter();
  const [folders, setFolders] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const [foldersRes, notesRes] = await Promise.all([
        axios.get('http://localhost:4000/api/school/notes/folders', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:4000/api/school/notes', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setFolders(foldersRes.data.folders);
      setNotes(notesRes.data.notes);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <AppLayout><div className="flex items-center justify-center h-full"><div className="text-lg" style={{ color: 'rgb(var(--fg-muted))' }}>Lädt...</div></div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'rgb(var(--fg))' }}>
            📝 Notizen
          </h1>
          <p style={{ color: 'rgb(var(--fg-muted))' }}>
            Lernmaterialien, Mitschriften und Zusammenfassungen
          </p>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {/* Folder Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <h3 className="font-bold" style={{ color: 'rgb(var(--fg))' }}>Ordner</h3>
              </CardHeader>
              <CardContent>
                {folders.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm" style={{ color: 'rgb(var(--fg-muted))' }}>Keine Ordner</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {folders.map((folder) => (
                      <button
                        key={folder.id}
                        onClick={() => setSelectedFolder(folder.id)}
                        className="w-full text-left p-2 rounded transition-colors"
                        style={{
                          backgroundColor: selectedFolder === folder.id ? 'rgba(var(--accent), 0.1)' : 'transparent',
                          color: selectedFolder === folder.id ? 'rgb(var(--accent))' : 'rgb(var(--fg))'
                        }}
                      >
                        📁 {folder.name}
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Notes Grid */}
          <div className="col-span-3">
            {notes.length === 0 ? (
              <Card>
                <CardContent className="text-center py-16">
                  <div className="text-6xl mb-4">📚</div>
                  <p className="text-lg mb-2" style={{ color: 'rgb(var(--fg))' }}>Noch keine Notizen</p>
                  <p style={{ color: 'rgb(var(--fg-muted))' }}>Erstelle Ordner und Notizen für deine Lernmaterialien</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {notes.map((note) => (
                  <Card key={note.id} className="cursor-pointer transition-all hover:scale-105">
                    <CardContent className="p-4">
                      <h3 className="font-bold mb-2" style={{ color: 'rgb(var(--fg))' }}>
                        {note.title}
                      </h3>
                      <p className="text-sm line-clamp-3" style={{ color: 'rgb(var(--fg-muted))' }}>
                        {note.content}
                      </p>
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {note.tags.map((tag: string) => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-1 rounded"
                              style={{ backgroundColor: 'rgba(var(--accent), 0.1)', color: 'rgb(var(--accent))' }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
