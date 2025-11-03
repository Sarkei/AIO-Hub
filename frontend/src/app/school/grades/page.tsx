/**
 * ============================================================================
 * SCHOOL GRADES PAGE - TACTICAL DESIGN
 * ============================================================================
 * 
 * Purpose: Comprehensive grade tracking and performance analysis
 * Design: Tactical/Military theme with color-coded grade visualization
 * 
 * Features:
 * - 📊 Subject-based grade grouping
 * - 🎯 Weighted average calculation
 * - 🎨 Color-coded performance indicators (green: ≤2, yellow: ≤3, red: >3)
 * - 📈 Overall GPA and subject averages
 * - 📝 Multiple grade types (exam, test, oral, homework, project)
 * 
 * Search Keywords: #SCHOOL #GRADES #PERFORMANCE #AVERAGE #GPA
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
  TacticalStatCard, 
  TacticalEmptyState, 
  TacticalButton, 
  TacticalModal 
} from '@/components/tactical/TacticalComponents';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================
interface Grade { 
  id: string; 
  subject: string; 
  grade: number; 
  weight: number; 
  date: string; 
  description?: string; 
  gradeType: string; 
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function SchoolGradesPage() {
  const router = useRouter();

  // --------------------------------------------------------------------------
  // STATE MANAGEMENT
  // --------------------------------------------------------------------------
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ 
    subject: '', 
    grade: '', 
    weight: '1', 
    date: '', 
    description: '', 
    gradeType: 'EXAM' 
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

      const res = await axios.get('/api/school/grades', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      setGrades(res.data.grades || []);
      setLoading(false);
    } catch (error) {
      console.error('[GRADES] Error fetching data:', error);
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
      await axios.post('/api/school/grades', 
        { 
          ...formData, 
          grade: parseFloat(formData.grade), 
          weight: parseFloat(formData.weight) 
        }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setShowModal(false);
      setFormData({ subject: '', grade: '', weight: '1', date: '', description: '', gradeType: 'EXAM' });
      fetchData();
    } catch (error) {
      console.error('[GRADES] Error creating grade:', error);
    }
  };

  // --------------------------------------------------------------------------
  // EVENT HANDLERS - Delete
  // --------------------------------------------------------------------------
  const handleDelete = async (id: string) => {
    if (!confirm('Note löschen?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/school/grades/${id}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      fetchData();
    } catch (error) {
      console.error('[GRADES] Error deleting grade:', error);
    }
  };

  // --------------------------------------------------------------------------
  // CALCULATIONS - Overall Average
  // --------------------------------------------------------------------------
  const calculateAverage = () => {
    if (grades.length === 0) return 0;
    const totalWeight = grades.reduce((sum, g) => sum + g.weight, 0);
    const weightedSum = grades.reduce((sum, g) => sum + (g.grade * g.weight), 0);
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  };

  // --------------------------------------------------------------------------
  // UTILITY FUNCTIONS - Subject Management
  // --------------------------------------------------------------------------
  const getSubjects = () => Array.from(new Set(grades.map(g => g.subject)));
  const getGradesBySubject = (subject: string) => grades.filter(g => g.subject === subject);

  // --------------------------------------------------------------------------
  // CALCULATIONS - Subject Average
  // --------------------------------------------------------------------------
  const calculateSubjectAverage = (subject: string) => {
    const subjectGrades = getGradesBySubject(subject);
    if (subjectGrades.length === 0) return 0;
    
    const totalWeight = subjectGrades.reduce((sum, g) => sum + g.weight, 0);
    const weightedSum = subjectGrades.reduce((sum, g) => sum + (g.grade * g.weight), 0);
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  };

  // --------------------------------------------------------------------------
  // STYLING - Grade Color Coding
  // --------------------------------------------------------------------------
  const getGradeColor = (grade: number) => {
    if (grade <= 2) return TacticalStyles.colors.forest;     // Good: green
    if (grade <= 3) return TacticalStyles.colors.warning;    // Medium: yellow
    return TacticalStyles.colors.danger;                     // Bad: red
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
        <p style={{ color: TacticalStyles.colors.fgMuted }}>LADE NOTEN...</p>
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
            title="NOTEN" 
            subtitle="LEISTUNGSÜBERSICHT" 
            actions={
              <TacticalButton onClick={() => setShowModal(true)}>
                + NOTE
              </TacticalButton>
            } 
          />

          {/* ================================================================
              EMPTY STATE
              ================================================================ */}
          {grades.length === 0 ? (
            <TacticalEmptyState 
              icon="📊" 
              title="KEINE NOTEN" 
              description="Trage deine erste Note ein." 
              actionLabel="+ ERSTE NOTE" 
              onAction={() => setShowModal(true)} 
            />
          ) : (
            <>
              {/* ============================================================
                  OVERALL STATISTICS
                  ============================================================ */}
              <TacticalSection title="GESAMTÜBERSICHT" markerColor="accent">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <TacticalStatCard 
                    label="DURCHSCHNITT" 
                    value={calculateAverage().toFixed(2)} 
                    unit="NOTE" 
                    borderColor="accent" 
                  />
                  <TacticalStatCard 
                    label="ANZAHL NOTEN" 
                    value={grades.length} 
                    unit="GESAMT" 
                    borderColor="forest" 
                  />
                  <TacticalStatCard 
                    label="FÄCHER" 
                    value={getSubjects().length} 
                    unit="AKTIV" 
                    borderColor="olive" 
                  />
                </div>
              </TacticalSection>

              {/* ============================================================
                  SUBJECT-BASED GRADE DISPLAY
                  ============================================================ */}
              <TacticalSection title="NACH FACH" markerColor="forest">
                {getSubjects().map(subject => {
                  const subjectGrades = getGradesBySubject(subject);
                  const avg = calculateSubjectAverage(subject);
                  
                  return (
                    <div 
                      key={subject} 
                      style={{ 
                        backgroundColor: TacticalStyles.colors.card, 
                        border: TacticalStyles.borders.default, 
                        borderRadius: '0.5rem', 
                        padding: '1.5rem', 
                        marginBottom: '1rem' 
                      }}
                    >
                      {/* Subject Header with Average */}
                      <div className="flex justify-between items-center mb-3">
                        <h3 style={{ 
                          fontSize: '1.25rem', 
                          fontWeight: '700', 
                          color: TacticalStyles.colors.fg 
                        }}>
                          {subject}
                        </h3>
                        <div style={{ 
                          fontSize: '1.5rem', 
                          fontWeight: '900', 
                          color: getGradeColor(avg) 
                        }}>
                          {avg.toFixed(2)}
                        </div>
                      </div>

                      {/* Individual Grades */}
                      <div className="space-y-2">
                        {subjectGrades.map(grade => (
                          <div 
                            key={grade.id} 
                            style={{ 
                              backgroundColor: TacticalStyles.colors.cardHover, 
                              border: TacticalStyles.borders.subtle, 
                              borderRadius: '0.375rem', 
                              padding: '1rem', 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center' 
                            }}
                          >
                            {/* Grade Info */}
                            <div>
                              <div style={{ 
                                fontWeight: '600', 
                                color: TacticalStyles.colors.fg, 
                                marginBottom: '0.25rem' 
                              }}>
                                {grade.description || grade.gradeType}
                              </div>
                              <div style={{ 
                                ...TacticalStyles.typography.bodyMono, 
                                fontSize: '0.875rem', 
                                color: TacticalStyles.colors.fgMuted 
                              }}>
                                {new Date(grade.date).toLocaleDateString('de-DE')} • GEWICHTUNG: {grade.weight}x
                              </div>
                            </div>

                            {/* Grade Value & Actions */}
                            <div className="flex items-center gap-3">
                              <div style={{ 
                                fontSize: '1.5rem', 
                                fontWeight: '900', 
                                color: getGradeColor(grade.grade) 
                              }}>
                                {grade.grade.toFixed(1)}
                              </div>
                              <TacticalButton 
                                variant="danger" 
                                onClick={() => handleDelete(grade.id)}
                              >
                                DEL
                              </TacticalButton>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </TacticalSection>
            </>
          )}

          {/* ================================================================
              CREATE GRADE MODAL
              ================================================================ */}
          <TacticalModal 
            isOpen={showModal} 
            onClose={() => setShowModal(false)} 
            title="NEUE NOTE"
          >
            <form onSubmit={handleCreate}>
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

              {/* Grade Value & Weight */}
              <div className="grid grid-cols-2 gap-4" style={{ marginBottom: '1rem' }}>
                <div>
                  <label style={TacticalHelpers.getLabelStyles()}>NOTE *</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    min="1" 
                    max="6" 
                    value={formData.grade} 
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })} 
                    required 
                    style={TacticalHelpers.getInputStyles()} 
                  />
                </div>
                <div>
                  <label style={TacticalHelpers.getLabelStyles()}>GEWICHTUNG *</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    min="0.1" 
                    value={formData.weight} 
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })} 
                    required 
                    style={TacticalHelpers.getInputStyles()} 
                  />
                </div>
              </div>

              {/* Date */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={TacticalHelpers.getLabelStyles()}>DATUM *</label>
                <input 
                  type="date" 
                  value={formData.date} 
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })} 
                  required 
                  style={TacticalHelpers.getInputStyles()} 
                />
              </div>

              {/* Grade Type */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={TacticalHelpers.getLabelStyles()}>TYP *</label>
                <select 
                  value={formData.gradeType} 
                  onChange={(e) => setFormData({ ...formData, gradeType: e.target.value })} 
                  required 
                  style={TacticalHelpers.getInputStyles()}
                >
                  <option value="EXAM">KLAUSUR</option>
                  <option value="TEST">TEST</option>
                  <option value="ORAL">MÜNDLICH</option>
                  <option value="HOMEWORK">HAUSAUFGABE</option>
                  <option value="PROJECT">PROJEKT</option>
                </select>
              </div>

              {/* Description (Optional) */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={TacticalHelpers.getLabelStyles()}>BESCHREIBUNG</label>
                <input 
                  type="text" 
                  value={formData.description} 
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
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
