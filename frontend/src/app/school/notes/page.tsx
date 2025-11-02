'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import AppLayout from '@/components/AppLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Label from '@/components/ui/Label';
import Textarea from '@/components/ui/Textarea';

interface NoteFolder {
  id: string;
  name: string;
  path: string;
  parentId: string | null;
  createdAt: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface NoteFile {
  id: string;
  noteId: string | null;
  filename: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
}

export default function SchoolNotesPage() {
  const router = useRouter();
  const [folders, setFolders] = useState<NoteFolder[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [files, setFiles] = useState<NoteFile[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showCreateNoteModal, setShowCreateNoteModal] = useState(false);
  const [view, setView] = useState<'folders' | 'notes' | 'files'>('folders');

  const [folderForm, setFolderForm] = useState({
    name: '',
    parentId: ''
  });

  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    folderId: '',
    tags: ''
  });

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

      // Temporär: Bis die Backend-Endpoints implementiert sind, zeigen wir eine leere Ansicht
      setFolders([]);
      setNotes([]);
      setFiles([]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:4000/api/school/notes/folders',
        folderForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowCreateFolderModal(false);
      setFolderForm({ name: '', parentId: '' });
      fetchData();
    } catch (error) {
      console.error('Error creating folder:', error);
      alert('Fehler beim Erstellen des Ordners');
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const tagsArray = noteForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      await axios.post(
        'http://localhost:4000/api/school/notes',
        {
          ...noteForm,
          tags: tagsArray
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowCreateNoteModal(false);
      setNoteForm({ title: '', content: '', folderId: '', tags: '' });
      fetchData();
    } catch (error) {
      console.error('Error creating note:', error);
      alert('Fehler beim Erstellen der Notiz');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    if (selectedFolderId) {
      formData.append('folderId', selectedFolderId);
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:4000/api/school/notes/files/upload',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      fetchData();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Fehler beim Hochladen der Datei');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-lg" style={{ color: 'rgb(var(--fg-muted))' }}>
            Lädt...
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'rgb(var(--fg))' }}>
            📝 Notizen
          </h1>
          <p style={{ color: 'rgb(var(--fg-muted))' }}>
            Lernmaterialien, Mitschriften und Dokumente
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setView('folders')}
            style={{
              backgroundColor: view === 'folders' ? 'rgb(var(--accent))' : 'rgb(var(--bg-elevated))',
              color: view === 'folders' ? 'white' : 'rgb(var(--fg))'
            }}
          >
            📁 Ordner
          </Button>
          <Button
            onClick={() => setView('notes')}
            style={{
              backgroundColor: view === 'notes' ? 'rgb(var(--accent))' : 'rgb(var(--bg-elevated))',
              color: view === 'notes' ? 'white' : 'rgb(var(--fg))'
            }}
          >
            📝 Notizen
          </Button>
          <Button
            onClick={() => setView('files')}
            style={{
              backgroundColor: view === 'files' ? 'rgb(var(--accent))' : 'rgb(var(--bg-elevated))',
              color: view === 'files' ? 'white' : 'rgb(var(--fg))'
            }}
          >
            📎 Dateien
          </Button>
        </div>

        {/* Folders View */}
        {view === 'folders' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="text-xl font-bold" style={{ color: 'rgb(var(--fg))' }}>
                Ordner
              </h3>
              <Button onClick={() => setShowCreateFolderModal(true)}>
                + Neuer Ordner
              </Button>
            </CardHeader>
            <CardContent>
              {folders.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">📁</div>
                  <p className="text-lg mb-2" style={{ color: 'rgb(var(--fg))' }}>
                    Noch keine Ordner
                  </p>
                  <p style={{ color: 'rgb(var(--fg-muted))' }}>
                    Erstelle Ordner, um deine Notizen zu organisieren
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {folders.map((folder) => (
                    <Card
                      key={folder.id}
                      className="cursor-pointer transition-all hover:scale-105"
                      onClick={() => {
                        setSelectedFolderId(folder.id);
                        setView('notes');
                      }}
                      style={{
                        backgroundColor: 'rgb(var(--bg-elevated))',
                        border: '1px solid rgb(var(--card-border))'
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="text-4xl mb-2">📁</div>
                        <h4 className="font-bold" style={{ color: 'rgb(var(--fg))' }}>
                          {folder.name}
                        </h4>
                        <p className="text-xs mt-1" style={{ color: 'rgb(var(--fg-muted))' }}>
                          {folder.path}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Notes View */}
        {view === 'notes' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <h3 className="text-xl font-bold" style={{ color: 'rgb(var(--fg))' }}>
                  Notizen
                </h3>
                {selectedFolderId && (
                  <button
                    onClick={() => setSelectedFolderId(null)}
                    className="text-sm mt-1"
                    style={{ color: 'rgb(var(--accent))' }}
                  >
                    ← Alle Notizen anzeigen
                  </button>
                )}
              </div>
              <Button onClick={() => setShowCreateNoteModal(true)}>
                + Neue Notiz
              </Button>
            </CardHeader>
            <CardContent>
              {notes.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">📝</div>
                  <p className="text-lg mb-2" style={{ color: 'rgb(var(--fg))' }}>
                    Noch keine Notizen
                  </p>
                  <p style={{ color: 'rgb(var(--fg-muted))' }}>
                    Erstelle deine erste Notiz
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notes.map((note) => (
                    <Card
                      key={note.id}
                      className="cursor-pointer transition-all hover:shadow-lg"
                      onClick={() => setSelectedNote(note)}
                      style={{
                        backgroundColor: 'rgb(var(--bg-elevated))',
                        border: '1px solid rgb(var(--card-border))'
                      }}
                    >
                      <CardContent className="p-4">
                        <h4 className="font-bold mb-2" style={{ color: 'rgb(var(--fg))' }}>
                          {note.title}
                        </h4>
                        <p
                          className="text-sm mb-2 line-clamp-2"
                          style={{ color: 'rgb(var(--fg-muted))' }}
                        >
                          {note.content}
                        </p>
                        {note.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {note.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-1 rounded"
                                style={{
                                  backgroundColor: 'rgba(var(--accent), 0.1)',
                                  color: 'rgb(var(--accent))'
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <div
                          className="text-xs mt-2"
                          style={{ color: 'rgb(var(--fg-muted))' }}
                        >
                          Aktualisiert: {new Date(note.updatedAt).toLocaleDateString('de-DE')}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Files View */}
        {view === 'files' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="text-xl font-bold" style={{ color: 'rgb(var(--fg))' }}>
                Dateien
              </h3>
              <div>
                <input
                  type="file"
                  id="fileUpload"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <Button onClick={() => document.getElementById('fileUpload')?.click()}>
                  + Datei hochladen
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {files.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">📎</div>
                  <p className="text-lg mb-2" style={{ color: 'rgb(var(--fg))' }}>
                    Noch keine Dateien
                  </p>
                  <p style={{ color: 'rgb(var(--fg-muted))' }}>
                    Lade PDFs, Bilder und andere Dokumente hoch
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {files.map((file) => (
                    <Card
                      key={file.id}
                      className="cursor-pointer transition-all hover:scale-105"
                      style={{
                        backgroundColor: 'rgb(var(--bg-elevated))',
                        border: '1px solid rgb(var(--card-border))'
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="text-4xl mb-2">
                          {file.fileType.includes('pdf') ? '📄' : 
                           file.fileType.includes('image') ? '🖼️' : '📎'}
                        </div>
                        <h4 className="font-bold mb-1" style={{ color: 'rgb(var(--fg))' }}>
                          {file.filename}
                        </h4>
                        <p className="text-xs" style={{ color: 'rgb(var(--fg-muted))' }}>
                          {(file.fileSize / 1024).toFixed(2)} KB
                        </p>
                        <p className="text-xs" style={{ color: 'rgb(var(--fg-muted))' }}>
                          {new Date(file.createdAt).toLocaleDateString('de-DE')}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Create Folder Modal */}
        {showCreateFolderModal && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            onClick={() => setShowCreateFolderModal(false)}
          >
            <Card
              className="w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader>
                <h3 className="text-xl font-bold" style={{ color: 'rgb(var(--fg))' }}>
                  Neuer Ordner
                </h3>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateFolder} className="space-y-4">
                  <div>
                    <Label>Ordnername *</Label>
                    <Input
                      value={folderForm.name}
                      onChange={(e) => setFolderForm({ ...folderForm, name: e.target.value })}
                      placeholder="z.B. Mathematik, Programmieren"
                      required
                    />
                  </div>
                  {folders.length > 0 && (
                    <div>
                      <Label>Übergeordneter Ordner (optional)</Label>
                      <select
                        value={folderForm.parentId}
                        onChange={(e) => setFolderForm({ ...folderForm, parentId: e.target.value })}
                        className="w-full px-3 py-2 rounded"
                        style={{
                          backgroundColor: 'rgb(var(--bg-elevated))',
                          color: 'rgb(var(--fg))',
                          border: '1px solid rgb(var(--card-border))'
                        }}
                      >
                        <option value="">Kein übergeordneter Ordner</option>
                        {folders.map((folder) => (
                          <option key={folder.id} value={folder.id}>
                            {folder.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <Button type="submit" className="flex-1">
                      Erstellen
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setShowCreateFolderModal(false)}
                    >
                      Abbrechen
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Create Note Modal */}
        {showCreateNoteModal && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            onClick={() => setShowCreateNoteModal(false)}
          >
            <Card
              className="w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader>
                <h3 className="text-xl font-bold" style={{ color: 'rgb(var(--fg))' }}>
                  Neue Notiz
                </h3>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateNote} className="space-y-4">
                  <div>
                    <Label>Titel *</Label>
                    <Input
                      value={noteForm.title}
                      onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                      placeholder="Titel der Notiz"
                      required
                    />
                  </div>
                  <div>
                    <Label>Inhalt *</Label>
                    <Textarea
                      value={noteForm.content}
                      onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                      placeholder="Deine Notizen hier..."
                      rows={10}
                      required
                    />
                  </div>
                  {folders.length > 0 && (
                    <div>
                      <Label>Ordner (optional)</Label>
                      <select
                        value={noteForm.folderId}
                        onChange={(e) => setNoteForm({ ...noteForm, folderId: e.target.value })}
                        className="w-full px-3 py-2 rounded"
                        style={{
                          backgroundColor: 'rgb(var(--bg-elevated))',
                          color: 'rgb(var(--fg))',
                          border: '1px solid rgb(var(--card-border))'
                        }}
                      >
                        <option value="">Kein Ordner</option>
                        {folders.map((folder) => (
                          <option key={folder.id} value={folder.id}>
                            {folder.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <Label>Tags (optional)</Label>
                    <Input
                      value={noteForm.tags}
                      onChange={(e) => setNoteForm({ ...noteForm, tags: e.target.value })}
                      placeholder="z.B. wichtig, prüfung, zusammenfassung (kommagetrennt)"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button type="submit" className="flex-1">
                      Erstellen
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setShowCreateNoteModal(false)}
                    >
                      Abbrechen
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Note Detail Modal */}
        {selectedNote && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            onClick={() => setSelectedNote(null)}
          >
            <Card
              className="w-full max-w-4xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2" style={{ color: 'rgb(var(--fg))' }}>
                    {selectedNote.title}
                  </h3>
                  {selectedNote.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {selectedNote.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 rounded"
                          style={{
                            backgroundColor: 'rgba(var(--accent), 0.1)',
                            color: 'rgb(var(--accent))'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <Button onClick={() => setSelectedNote(null)}>✕</Button>
              </CardHeader>
              <CardContent>
                <div
                  className="prose max-w-none"
                  style={{ color: 'rgb(var(--fg))' }}
                >
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                    {selectedNote.content}
                  </pre>
                </div>
                <div
                  className="text-xs mt-6 pt-4"
                  style={{ 
                    color: 'rgb(var(--fg-muted))',
                    borderTop: '1px solid rgb(var(--card-border))'
                  }}
                >
                  Erstellt: {new Date(selectedNote.createdAt).toLocaleString('de-DE')} | 
                  Aktualisiert: {new Date(selectedNote.updatedAt).toLocaleString('de-DE')}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
