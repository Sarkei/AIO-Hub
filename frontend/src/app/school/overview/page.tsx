/**
 * ============================================================================
 * SCHOOL OVERVIEW PAGE - TACTICAL DESIGN
 * ============================================================================
 * 
 * Purpose: Central dashboard for all school-related activities
 * Design: Tactical/Military theme with lime green accents
 * 
 * Features:
 * - 📊 Statistics overview (notes, todos, grades, upcoming)
 * - 🚀 Quick action buttons for common tasks
 * - 📚 Active school year display
 * 
 * Search Keywords: #SCHOOL #DASHBOARD #OVERVIEW #STATS
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
  TacticalButton 
} from '@/components/tactical/TacticalComponents';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================
interface SchoolYear { 
  id: string; 
  name: string; 
  start_date: string; 
  end_date: string; 
  is_active: boolean; 
}

interface Stats {
  totalNotes: number;
  totalTodos: number;
  avgGrade: number;
  upcomingTodos: number;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function SchoolOverviewPage() {
  const router = useRouter();

  // --------------------------------------------------------------------------
  // STATE MANAGEMENT
  // --------------------------------------------------------------------------
  const [activeYear, setActiveYear] = useState<SchoolYear | null>(null);
  const [stats, setStats] = useState<Stats>({ 
    totalNotes: 0, 
    totalTodos: 0, 
    avgGrade: 0, 
    upcomingTodos: 0 
  });
  const [loading, setLoading] = useState(true);

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

      // Fetch active school year
      const activeRes = await axios.get('/api/school/years/active', { 
        headers: { Authorization: `Bearer ${token}` } 
      }).catch(() => ({ data: { schoolYear: null } }));

      setActiveYear(activeRes.data.schoolYear);

      // Mock statistics - replace with real API calls
      setStats({ 
        totalNotes: 12, 
        totalTodos: 5, 
        avgGrade: 2.3, 
        upcomingTodos: 3 
      });

      setLoading(false);
    } catch (error) {
      console.error('[SCHOOL-OVERVIEW] Error fetching data:', error);
      setLoading(false);
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
        <p style={{ color: TacticalStyles.colors.fgMuted }}>LADE ÜBERSICHT...</p>
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
            title="SCHUL-ÜBERSICHT"
            subtitle={activeYear ? activeYear.name : 'KEIN AKTIVES SCHULJAHR'}
            actions={
              <div className="flex gap-2">
                <TacticalButton 
                  variant="secondary" 
                  onClick={() => router.push('/school/notes')}
                >
                  📝 NOTIZEN
                </TacticalButton>
                <TacticalButton 
                  variant="secondary" 
                  onClick={() => router.push('/school/todos')}
                >
                  ✅ TODOS
                </TacticalButton>
                <TacticalButton 
                  variant="secondary" 
                  onClick={() => router.push('/school/grades')}
                >
                  📊 NOTEN
                </TacticalButton>
              </div>
            }
          />

          {/* ================================================================
              NO ACTIVE YEAR STATE
              ================================================================ */}
          {!activeYear ? (
            <TacticalEmptyState 
              icon="📚" 
              title="KEIN SCHULJAHR AKTIV" 
              description="Erstelle zuerst ein Schuljahr um loszulegen." 
              actionLabel="ZUM SETUP" 
              onAction={() => router.push('/school/setup')} 
            />
          ) : (
            <>
              {/* ============================================================
                  STATISTICS OVERVIEW
                  ============================================================ */}
              <TacticalSection title="SCHNELLÜBERSICHT" markerColor="accent">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <TacticalStatCard 
                    label="NOTIZEN" 
                    value={stats.totalNotes} 
                    unit="GESAMT" 
                    borderColor="accent" 
                    onClick={() => router.push('/school/notes')} 
                  />
                  <TacticalStatCard 
                    label="OFFENE TODOS" 
                    value={stats.totalTodos} 
                    unit="TASKS" 
                    borderColor="warning" 
                    onClick={() => router.push('/school/todos')} 
                  />
                  <TacticalStatCard 
                    label="DURCHSCHNITT" 
                    value={stats.avgGrade.toFixed(1)} 
                    unit="NOTE" 
                    borderColor="forest" 
                    onClick={() => router.push('/school/grades')} 
                  />
                  <TacticalStatCard 
                    label="ANSTEHEND" 
                    value={stats.upcomingTodos} 
                    unit="DIESE WOCHE" 
                    borderColor="olive" 
                    onClick={() => router.push('/school/timetable')} 
                  />
                </div>
              </TacticalSection>

              {/* ============================================================
                  QUICK ACTIONS
                  ============================================================ */}
              <TacticalSection title="QUICK ACTIONS" markerColor="forest">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* New Note Action */}
                  <div 
                    onClick={() => router.push('/school/notes')} 
                    style={{ 
                      backgroundColor: TacticalStyles.colors.card, 
                      border: TacticalStyles.borders.default, 
                      borderRadius: '0.5rem', 
                      padding: '1.5rem', 
                      cursor: 'pointer' 
                    }} 
                    className="hover:scale-[1.02] transition-all"
                  >
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📝</div>
                    <div style={{ 
                      fontSize: '1.125rem', 
                      fontWeight: '700', 
                      color: TacticalStyles.colors.fg 
                    }}>
                      NEUE NOTIZ
                    </div>
                    <div style={{ 
                      fontSize: '0.875rem', 
                      color: TacticalStyles.colors.fgMuted 
                    }}>
                      Erstelle eine neue Notiz
                    </div>
                  </div>

                  {/* New Todo Action */}
                  <div 
                    onClick={() => router.push('/school/todos')} 
                    style={{ 
                      backgroundColor: TacticalStyles.colors.card, 
                      border: TacticalStyles.borders.default, 
                      borderRadius: '0.5rem', 
                      padding: '1.5rem', 
                      cursor: 'pointer' 
                    }} 
                    className="hover:scale-[1.02] transition-all"
                  >
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✅</div>
                    <div style={{ 
                      fontSize: '1.125rem', 
                      fontWeight: '700', 
                      color: TacticalStyles.colors.fg 
                    }}>
                      NEUER TODO
                    </div>
                    <div style={{ 
                      fontSize: '0.875rem', 
                      color: TacticalStyles.colors.fgMuted 
                    }}>
                      Füge eine Aufgabe hinzu
                    </div>
                  </div>

                  {/* Timetable Action */}
                  <div 
                    onClick={() => router.push('/school/timetable')} 
                    style={{ 
                      backgroundColor: TacticalStyles.colors.card, 
                      border: TacticalStyles.borders.default, 
                      borderRadius: '0.5rem', 
                      padding: '1.5rem', 
                      cursor: 'pointer' 
                    }} 
                    className="hover:scale-[1.02] transition-all"
                  >
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📅</div>
                    <div style={{ 
                      fontSize: '1.125rem', 
                      fontWeight: '700', 
                      color: TacticalStyles.colors.fg 
                    }}>
                      STUNDENPLAN
                    </div>
                    <div style={{ 
                      fontSize: '0.875rem', 
                      color: TacticalStyles.colors.fgMuted 
                    }}>
                      Zeige deinen Stundenplan
                    </div>
                  </div>
                </div>
              </TacticalSection>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
