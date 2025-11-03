/**
 * ============================================================================
 * SCHOOL NOTES PAGE - TACTICAL DESIGN
 * ============================================================================
 * 
 * Purpose: Manage school notes with folder organization and tagging system
 * Design: Tactical/Military theme with lime green accents
 * 
 * Features:
 * - 📁 Folder management for note organization
 * - 📝 Note creation with markdown support
 * - 🏷️ Tag system for categorization
 * - 🔍 Folder/Notes view switching
 * 
 * Search Keywords: #SCHOOL #NOTES #FOLDERS #TAGS #ORGANIZATION
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
  TacticalModal, 
  TacticalActionCard 
} from '@/components/tactical/TacticalComponents';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================
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

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function SchoolNotesPage() {
  const router = useRouter();

  // --------------------------------------------------------------------------
  // STATE MANAGEMENT
  // --------------------------------------------------------------------------
  const [folders, setFolders] = useState<NoteFolder[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'folders' | 'notes'>('folders');
  
  // Modal States
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  
  // Form States
  const [folderForm, setFolderForm] = useState({ name: '', parentId: '' });
  const [noteForm, setNoteForm] = useState({ title: '', content: '', folderId: '', tags: '' });

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

      const [foldersRes, notesRes] = await Promise.all([
        axios.get('/api/school/notes/folders', { 
          headers: { Authorization: `Bearer ${token}` } 
        }),
        axios.get('/api/school/notes', { 
          headers: { Authorization: `Bearer ${token}` } 
        })
      ]);

      setFolders(foldersRes.data.folders || []);
      setNotes(notesRes.data.notes || []);
      setLoading(false);
    } catch (error) {
      console.error('[NOTES] Error fetching data:', error);
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // EVENT HANDLERS - Folder Management
  // --------------------------------------------------------------------------
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/school/notes/folders', folderForm, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      setShowFolderModal(false);
      setFolderForm({ name: '', parentId: '' });
      fetchData();
    } catch (error) {
      console.error('[NOTES] Error creating folder:', error);
    }
  };

  // --------------------------------------------------------------------------
  // EVENT HANDLERS - Note Management
  // --------------------------------------------------------------------------
  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...noteForm,
        folderId: selectedFolderId || null,
        tags: noteForm.tags ? noteForm.tags.split(',').map(t => t.trim()) : []
      };

      await axios.post('/api/school/notes', payload, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      setShowNoteModal(false);
      setNoteForm({ title: '', content: '', folderId: '', tags: '' });
      fetchData();
    } catch (error) {
      console.error('[NOTES] Error creating note:', error);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm('Notiz wirklich löschen?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/school/notes/${id}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      fetchData();
    } catch (error) {
      console.error('[NOTES] Error deleting note:', error);
    }
  };

  // --------------------------------------------------------------------------
  // UTILITY FUNCTIONS
  // --------------------------------------------------------------------------
  const getNotesInFolder = (folderId: string | null) => {
    return notes.filter(n => n.folderId === folderId);
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
        <p style={{ color: TacticalStyles.colors.fgMuted }}>LADE NOTIZEN...</p>
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
            title="NOTIZEN"
            subtitle="DOKUMENTE & ORDNER"
            actions={
              <div className="flex gap-2">
                <TacticalButton 
                  variant="secondary" 
                  onClick={() => setView(view === 'folders' ? 'notes' : 'folders')}
                >
                  {view === 'folders' ? '📄 NOTIZEN' : '📁 ORDNER'}
                </TacticalButton>
                {view === 'folders' ? (
                  <TacticalButton onClick={() => {
                    setFolderForm({ name: '', parentId: '' });
                    setShowFolderModal(true);
                  }}>
                    + ORDNER
                  </TacticalButton>
                ) : (
                  <TacticalButton onClick={() => {
                    setNoteForm({ title: '', content: '', folderId: '', tags: '' });
                    setShowNoteModal(true);
                  }}>
                    + NOTIZ
                  </TacticalButton>
                )}
              </div>
            }
          />

          {/* ================================================================
              FOLDERS VIEW
              ================================================================ */}
          {view === 'folders' ? (
            <TacticalSection title="ORDNERSTRUKTUR" markerColor="accent">
              {folders.length === 0 ? (
                <TacticalEmptyState 
                  icon="📁" 
                  title="KEINE ORDNER" 
                  description="Erstelle deinen ersten Ordner für Notizen." 
                  actionLabel="+ ERSTEN ORDNER ERSTELLEN" 
                  onAction={() => setShowFolderModal(true)} 
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {folders.map(folder => {
                    const folderNotes = getNotesInFolder(folder.id);
                    return (
                      <TacticalActionCard
                        key={folder.id}
                        icon="📁"
                        title={folder.name}
                        description={`${folderNotes.length} Notizen`}
                        onClick={() => {
                          setSelectedFolderId(folder.id);
                          setView('notes');
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </TacticalSection>
          ) : (
            
            /* ================================================================
               NOTES VIEW
               ================================================================ */
            <TacticalSection 
              title={selectedFolderId 
                ? folders.find(f => f.id === selectedFolderId)?.name || 'NOTIZEN' 
                : 'ALLE NOTIZEN'
              } 
              markerColor="forest"
            >
              {getNotesInFolder(selectedFolderId).length === 0 ? (
                <TacticalEmptyState 
                  icon="📄" 
                  title="KEINE NOTIZEN" 
                  description="Erstelle deine erste Notiz in diesem Ordner." 
                  actionLabel="+ ERSTE NOTIZ ERSTELLEN" 
                  onAction={() => setShowNoteModal(true)} 
                />
              ) : (
                <div className="space-y-3">
                  {getNotesInFolder(selectedFolderId).map(note => (
                    <div 
                      key={note.id} 
                      style={{ 
                        backgroundColor: TacticalStyles.colors.card, 
                        border: TacticalStyles.borders.default, 
                        borderRadius: '0.5rem', 
                        padding: '1.5rem' 
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 style={{ 
                            fontSize: '1.25rem', 
                            fontWeight: '700', 
                            color: TacticalStyles.colors.fg, 
                            marginBottom: '0.5rem' 
                          }}>
                            {note.title}
                          </h3>
                          <p style={{ 
                            fontSize: '0.875rem', 
                            color: TacticalStyles.colors.fgMuted, 
                            marginBottom: '1rem' 
                          }}>
                            {note.content.substring(0, 200)}
                            {note.content.length > 200 ? '...' : ''}
                          </p>
                          
                          {/* Tags */}
                          {note.tags && note.tags.length > 0 && (
                            <div className="flex gap-2 flex-wrap">
                              {note.tags.map((tag, idx) => (
                                <span 
                                  key={idx} 
                                  style={{ 
                                    fontSize: '0.75rem', 
                                    fontWeight: '700', 
                                    color: TacticalStyles.colors.accent, 
                                    padding: '0.25rem 0.5rem', 
                                    border: `1px solid ${TacticalStyles.colors.accent}`, 
                                    borderRadius: '0.25rem' 
                                  }}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <TacticalButton onClick={() => setSelectedNote(note)}>
                            ANZEIGEN
                          </TacticalButton>
                          <TacticalButton 
                            variant="danger" 
                            onClick={() => handleDeleteNote(note.id)}
                          >
                            DEL
                          </TacticalButton>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TacticalSection>
          )}

          {/* ================================================================
              CREATE FOLDER MODAL
              ================================================================ */}
          <TacticalModal 
            isOpen={showFolderModal} 
            onClose={() => setShowFolderModal(false)} 
            title="NEUER ORDNER"
          >
            <form onSubmit={handleCreateFolder}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem', 
                  fontWeight: '700', 
                  color: TacticalStyles.colors.fg, 
                  marginBottom: '0.5rem',
                  textTransform: 'uppercase'
                }}>
                  NAME *
                </label>
                <input 
                  type="text" 
                  value={folderForm.name} 
                  onChange={(e: any) => setFolderForm({ ...folderForm, name: e.target.value })} 
                  required 
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: TacticalStyles.colors.card,
                    border: TacticalStyles.borders.subtle,
                    borderRadius: '0.375rem',
                    color: TacticalStyles.colors.fg,
                    fontSize: '1rem'
                  }} 
                />
              </div>
              <div className="flex justify-end gap-2">
                <TacticalButton 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setShowFolderModal(false)}
                >
                  ABBRECHEN
                </TacticalButton>
                <TacticalButton type="submit">ERSTELLEN</TacticalButton>
              </div>
            </form>
          </TacticalModal>

          {/* ================================================================
              CREATE NOTE MODAL
              ================================================================ */}
          <TacticalModal 
            isOpen={showNoteModal} 
            onClose={() => setShowNoteModal(false)} 
            title="NEUE NOTIZ"
          >
            <form onSubmit={handleCreateNote}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem', 
                  fontWeight: '700', 
                  color: TacticalStyles.colors.fg, 
                  marginBottom: '0.5rem',
                  textTransform: 'uppercase'
                }}>
                  TITEL *
                </label>
                <input 
                  type="text" 
                  value={noteForm.title} 
                  onChange={(e: any) => setNoteForm({ ...noteForm, title: e.target.value })} 
                  required 
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: TacticalStyles.colors.card,
                    border: TacticalStyles.borders.subtle,
                    borderRadius: '0.375rem',
                    color: TacticalStyles.colors.fg,
                    fontSize: '1rem'
                  }} 
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem', 
                  fontWeight: '700', 
                  color: TacticalStyles.colors.fg, 
                  marginBottom: '0.5rem',
                  textTransform: 'uppercase'
                }}>
                  INHALT *
                </label>
                <textarea 
                  value={noteForm.content} 
                  onChange={(e: any) => setNoteForm({ ...noteForm, content: e.target.value })} 
                  rows={10} 
                  required 
                  style={{ 
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: TacticalStyles.colors.card,
                    border: TacticalStyles.borders.subtle,
                    borderRadius: '0.375rem',
                    color: TacticalStyles.colors.fg,
                    fontSize: '1rem',
                    resize: 'vertical' as const, 
                    minHeight: '200px' 
                  }} 
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem', 
                  fontWeight: '700', 
                  color: TacticalStyles.colors.fg, 
                  marginBottom: '0.5rem',
                  textTransform: 'uppercase'
                }}>
                  TAGS (KOMMA-GETRENNT)
                </label>
                <input 
                  type="text" 
                  value={noteForm.tags} 
                  onChange={(e: any) => setNoteForm({ ...noteForm, tags: e.target.value })} 
                  placeholder="z.B. Mathe, Klausur, Wichtig" 
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: TacticalStyles.colors.card,
                    border: TacticalStyles.borders.subtle,
                    borderRadius: '0.375rem',
                    color: TacticalStyles.colors.fg,
                    fontSize: '1rem'
                  }} 
                />
              </div>
              <div className="flex justify-end gap-2">
                <TacticalButton 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setShowNoteModal(false)}
                >
                  ABBRECHEN
                </TacticalButton>
                <TacticalButton type="submit">ERSTELLEN</TacticalButton>
              </div>
            </form>
          </TacticalModal>

          {/* ================================================================
              NOTE DETAIL MODAL
              ================================================================ */}
          {selectedNote && (
            <TacticalModal 
              isOpen={!!selectedNote} 
              onClose={() => setSelectedNote(null)} 
              title={selectedNote.title}
            >
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ 
                  padding: '1rem', 
                  backgroundColor: TacticalStyles.colors.cardHover, 
                  border: TacticalStyles.borders.subtle, 
                  borderRadius: '0.5rem', 
                  whiteSpace: 'pre-wrap', 
                  color: TacticalStyles.colors.fg 
                }}>
                  {selectedNote.content}
                </div>
              </div>
              
              {/* Note Tags */}
              {selectedNote.tags && selectedNote.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-4">
                  {selectedNote.tags.map((tag, idx) => (
                    <span 
                      key={idx} 
                      style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: '700', 
                        color: TacticalStyles.colors.accent, 
                        padding: '0.25rem 0.5rem', 
                        border: `1px solid ${TacticalStyles.colors.accent}`, 
                        borderRadius: '0.25rem' 
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="flex justify-end">
                <TacticalButton onClick={() => setSelectedNote(null)}>
                  SCHLIEẞEN
                </TacticalButton>
              </div>
            </TacticalModal>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
