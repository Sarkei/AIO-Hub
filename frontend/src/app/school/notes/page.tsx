'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import dynamic from 'next/dynamic';
import AppLayout from '@/components/AppLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Label from '@/components/ui/Label';

// Dynamic imports für client-side only components
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
const PDFViewer = dynamic(() => import('@/components/PDFViewer'), { ssr: false });
const ImageEditor = dynamic(() => import('@/components/ImageEditor'), { ssr: false });

// React Quill CSS - wird nur client-side geladen
if (typeof window !== 'undefined') {
  require('react-quill/dist/quill.snow.css');
}

interface Folder {
  id: string;
  name: string;
  path: string;
  parent_id: string | null;
}

interface Note {
  id: string;
  folder_id: string | null;
  title: string;
  content: string;
  file_path: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface FileItem {
  id: string;
  folder_id: string;
  name: string;
  type: 'pdf' | 'image';
  path: string;
  url: string;
}

export default function NotesPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [folders, setFolders] = useState<Folder[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState(false);
  
  // Forms
  const [folderForm, setFolderForm] = useState({ name: '' });
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    tags: ''
  });

  const [view, setView] = useState<'grid' | 'editor' | 'file-viewer'>('grid');
  const [viewerFile, setViewerFile] = useState<{ id: string; url: string; type: 'pdf' | 'image' } | null>(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFolder]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const [foldersRes, notesRes, filesRes] = await Promise.all([
        axios.get('http://localhost:4000/api/school/notes/folders', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`http://localhost:4000/api/school/notes${selectedFolder ? `?folderId=${selectedFolder}` : ''}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`http://localhost:4000/api/school/notes/files${selectedFolder ? `?folderId=${selectedFolder}` : ''}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setFolders(foldersRes.data.folders);
      setNotes(notesRes.data.notes);
      
      // Files formatieren
      const formattedFiles: FileItem[] = filesRes.data.files.map((f: any) => ({
        id: f.id,
        folder_id: f.folder_id,
        name: f.filename,
        type: f.file_type.startsWith('image/') ? 'image' : 'pdf',
        path: f.file_path,
        url: `http://localhost:4000/api/school/notes/files/${f.id}`
      }));
      setFiles(formattedFiles);
      
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:4000/api/school/notes/folders',
        {
          name: folderForm.name,
          parentId: selectedFolder
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowFolderModal(false);
      setFolderForm({ name: '' });
      fetchData();
    } catch (error) {
      console.error('Error creating folder:', error);
      alert('Fehler beim Erstellen des Ordners');
    }
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        folderId: selectedFolder,
        title: noteForm.title,
        content: noteForm.content,
        tags: noteForm.tags.split(',').map(t => t.trim()).filter(Boolean)
      };

      if (editingNote && selectedNote) {
        await axios.put(
          `http://localhost:4000/api/school/notes/${selectedNote.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          'http://localhost:4000/api/school/notes',
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setShowNoteModal(false);
      setEditingNote(false);
      setNoteForm({ title: '', content: '', tags: '' });
      setSelectedNote(null);
      fetchData();
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Fehler beim Speichern der Notiz');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    if (selectedFolder) {
      formData.append('folderId', selectedFolder);
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:4000/api/school/notes/upload',
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

  const openNote = (note: Note) => {
    setSelectedNote(note);
    setNoteForm({
      title: note.title,
      content: note.content,
      tags: note.tags.join(', ')
    });
    setEditingNote(true);
    setView('editor');
  };

  const openNewNote = () => {
    setSelectedNote(null);
    setNoteForm({ title: '', content: '', tags: '' });
    setEditingNote(false);
    setView('editor');
  };

  const openFile = async (fileId: string, fileType: 'pdf' | 'image') => {
    try {
      const token = localStorage.getItem('token');
      const url = `http://localhost:4000/api/school/notes/files/${fileId}?token=${token}`;
      setViewerFile({ id: fileId, url, type: fileType });
      setView('file-viewer');
    } catch (error) {
      console.error('Error opening file:', error);
      alert('Fehler beim Öffnen der Datei');
    }
  };

  const handleSaveAnnotations = async (annotations: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!viewerFile) return;

      await axios.put(
        `http://localhost:4000/api/school/notes/files/${viewerFile.id}/annotations`,
        { annotations },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Annotationen gespeichert!');
    } catch (error) {
      console.error('Error saving annotations:', error);
      alert('Fehler beim Speichern der Annotationen');
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

  // Editor View
  if (view === 'editor') {
    return (
      <AppLayout>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center justify-between mb-4">
            <Button onClick={() => setView('grid')}>← Zurück</Button>
            <Button onClick={(e) => { e.preventDefault(); handleSaveNote(e); }}>
              💾 Speichern
            </Button>
          </div>
          <div className="flex-1 flex flex-col gap-4">
            <Input
              value={noteForm.title}
              onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
              placeholder="Notiz-Titel..."
              className="text-2xl font-bold"
            />
            <div className="flex-1" style={{ minHeight: '500px' }}>
              <ReactQuill
                theme="snow"
                value={noteForm.content}
                onChange={(content) => setNoteForm({ ...noteForm, content })}
                style={{ height: '100%' }}
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    [{ color: [] }, { background: [] }],
                    ['link', 'image'],
                    ['clean']
                  ]
                }}
              />
            </div>
            <Input
              value={noteForm.tags}
              onChange={(e) => setNoteForm({ ...noteForm, tags: e.target.value })}
              placeholder="Tags (komma-getrennt)..."
            />
          </div>
        </div>
      </AppLayout>
    );
  }

  // Grid View
  return (
    <AppLayout>
      {/* PDF Viewer */}
      {view === 'file-viewer' && viewerFile && viewerFile.type === 'pdf' && (
        <PDFViewer
          fileUrl={viewerFile.url}
          fileId={viewerFile.id}
          onClose={() => {
            setView('grid');
            setViewerFile(null);
          }}
          onSaveAnnotations={handleSaveAnnotations}
        />
      )}

      {/* Image Editor */}
      {view === 'file-viewer' && viewerFile && viewerFile.type === 'image' && (
        <ImageEditor
          imageUrl={viewerFile.url}
          fileId={viewerFile.id}
          onClose={() => {
            setView('grid');
            setViewerFile(null);
          }}
          onSave={async (canvas) => {
            const annotations = canvas.toJSON();
            await handleSaveAnnotations(annotations);
          }}
        />
      )}

      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'rgb(var(--fg))' }}>
            📝 Notizen
          </h1>
          <p style={{ color: 'rgb(var(--fg-muted))' }}>
            Lernmaterialien, Mitschriften und Dateien
          </p>
        </div>

        <div className="flex gap-4 mb-6">
          <Button onClick={() => setShowFolderModal(true)}>
            📁 Neuer Ordner
          </Button>
          <Button onClick={openNewNote}>
            📝 Neue Notiz
          </Button>
          <Button onClick={() => fileInputRef.current?.click()}>
            📤 Datei hochladen
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>

        <div className="grid grid-cols-4 gap-6">
          {/* Folder Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <h3 className="font-bold" style={{ color: 'rgb(var(--fg))' }}>Ordner</h3>
              </CardHeader>
              <CardContent>
                <button
                  onClick={() => setSelectedFolder(null)}
                  className="w-full text-left p-2 rounded mb-2 transition-colors"
                  style={{
                    backgroundColor: selectedFolder === null ? 'rgba(var(--accent), 0.1)' : 'transparent',
                    color: selectedFolder === null ? 'rgb(var(--accent))' : 'rgb(var(--fg))'
                  }}
                >
                  📂 Alle Notizen
                </button>
                {folders.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm" style={{ color: 'rgb(var(--fg-muted))' }}>
                      Keine Ordner
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
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

          {/* Notes & Files Grid */}
          <div className="col-span-3">
            {notes.length === 0 && files.length === 0 ? (
              <Card>
                <CardContent className="text-center py-16">
                  <div className="text-6xl mb-4">📚</div>
                  <p className="text-lg mb-2" style={{ color: 'rgb(var(--fg))' }}>
                    Noch keine Notizen oder Dateien
                  </p>
                  <p style={{ color: 'rgb(var(--fg-muted))' }}>
                    Erstelle deine erste Notiz oder lade Dateien hoch
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {/* Files */}
                {files.map((file) => (
                  <Card
                    key={file.id}
                    className="cursor-pointer transition-all hover:scale-105"
                    onClick={() => openFile(file.id, file.type)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold truncate" style={{ color: 'rgb(var(--fg))' }}>
                          {file.name}
                        </h3>
                        <span className="text-xl">
                          {file.type === 'pdf' ? '📕' : '🖼️'}
                        </span>
                      </div>
                      <p className="text-sm" style={{ color: 'rgb(var(--fg-muted))' }}>
                        {file.type === 'pdf' ? 'PDF-Datei' : 'Bild'}
                      </p>
                    </CardContent>
                  </Card>
                ))}

                {/* Notes */}
                {notes.map((note) => (
                  <Card
                    key={note.id}
                    className="cursor-pointer transition-all hover:scale-105"
                    onClick={() => openNote(note)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold" style={{ color: 'rgb(var(--fg))' }}>
                          {note.title}
                        </h3>
                        <span className="text-xl">📄</span>
                      </div>
                      <div
                        className="text-sm line-clamp-3 mb-2"
                        style={{ color: 'rgb(var(--fg-muted))' }}
                        dangerouslySetInnerHTML={{ __html: note.content }}
                      />
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {note.tags.map((tag) => (
                            <span
                              key={tag}
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Folder Modal */}
        {showFolderModal && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            onClick={() => setShowFolderModal(false)}
          >
            <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
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
                      onChange={(e) => setFolderForm({ name: e.target.value })}
                      placeholder="z.B. Mathematik"
                      required
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button type="submit" className="flex-1">
                      Erstellen
                    </Button>
                    <Button type="button" onClick={() => setShowFolderModal(false)}>
                      Abbrechen
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
