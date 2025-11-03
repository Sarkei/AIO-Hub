'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import AppLayout from '@/components/AppLayout';
import { TacticalStyles, TacticalHelpers } from '@/components/tactical/TacticalStyles';
import {
  TacticalHeader,
  TacticalSection,
  TacticalStatCard,
  TacticalEmptyState,
  TacticalButton,
  TacticalActionCard,
  TacticalModal,
} from '@/components/tactical/TacticalComponents';

// ==================== TYPES ====================
interface Set {
  id: string;
  exercise_id: string;
  reps: number;
  weight?: number;
  rpe?: number;
  notes?: string;
  created_at: string;
}

interface Exercise {
  id: string;
  workout_id: string;
  name: string;
  notes?: string;
  sets: Set[];
  created_at: string;
}

interface Workout {
  id: string;
  name: string;
  date: string;
  notes?: string;
  exercises?: Exercise[];
  created_at: string;
}

interface SetFormData {
  reps: string;
  weight: string;
  rpe: string;
  notes: string;
}

const emptySetForm: SetFormData = { reps: '', weight: '', rpe: '', notes: '' };

// ==================== MAIN COMPONENT ====================
export default function GymPage() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'active'>('list');
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  // Modal States
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showSetModal, setShowSetModal] = useState(false);

  // Form States
  const [workoutForm, setWorkoutForm] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [exerciseName, setExerciseName] = useState('');
  const [setForm, setSetForm] = useState<SetFormData>(emptySetForm);

  // ==================== FETCH DATA ====================
  const fetchWorkouts = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await axios.get('/api/workouts', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setWorkouts(response.data.workouts || []);
    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
      } else {
        console.error('Error fetching workouts:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchWorkoutDetails = async (workoutId: string): Promise<Workout | null> => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/workouts/${workoutId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.workout;
    } catch (error) {
      console.error('Error fetching workout details:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  // ==================== TIMER ====================
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatTimer = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ==================== HANDLERS ====================
  const handleCreateWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/workouts', workoutForm, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const newWorkout = response.data.workout;
      setShowWorkoutModal(false);
      setWorkoutForm({ name: '', date: new Date().toISOString().split('T')[0], notes: '' });

      const detailedWorkout = await fetchWorkoutDetails(newWorkout.id);
      if (detailedWorkout) {
        setActiveWorkout({ ...detailedWorkout, exercises: [] });
        setViewMode('active');
        setTimer(0);
        setTimerRunning(true);
      }

      fetchWorkouts();
    } catch (error) {
      console.error('Error creating workout:', error);
      alert('Fehler beim Erstellen des Workouts');
    }
  };

  const handleStartExistingWorkout = async (workout: Workout) => {
    const detailed = await fetchWorkoutDetails(workout.id);
    if (detailed) {
      setActiveWorkout(detailed);
      setViewMode('active');
      setTimer(0);
      setTimerRunning(true);
    }
  };

  const handleAddExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkout) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `/api/workouts/${activeWorkout.id}/exercises`,
        { name: exerciseName, notes: '' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updated = await fetchWorkoutDetails(activeWorkout.id);
      if (updated) setActiveWorkout(updated);

      setShowExerciseModal(false);
      setExerciseName('');
    } catch (error) {
      console.error('Error adding exercise:', error);
      alert('Fehler beim Hinzufügen der Übung');
    }
  };

  const handleAddSet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkout || !activeExercise) return;

    try {
      const token = localStorage.getItem('token');
      const payload: any = { reps: parseInt(setForm.reps) };
      if (setForm.weight) payload.weight = parseFloat(setForm.weight);
      if (setForm.rpe) payload.rpe = parseInt(setForm.rpe);
      if (setForm.notes) payload.notes = setForm.notes;

      await axios.post(
        `/api/workouts/${activeWorkout.id}/exercises/${activeExercise.id}/sets`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updated = await fetchWorkoutDetails(activeWorkout.id);
      if (updated) {
        setActiveWorkout(updated);
        setActiveExercise(
          updated.exercises?.find((e: Exercise) => e.id === activeExercise.id) || null
        );
      }

      setShowSetModal(false);
      setSetForm(emptySetForm);
    } catch (error) {
      console.error('Error adding set:', error);
      alert('Fehler beim Hinzufügen des Satzes');
    }
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    if (!activeWorkout || !confirm('Übung löschen?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/workouts/${activeWorkout.id}/exercises/${exerciseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updated = await fetchWorkoutDetails(activeWorkout.id);
      if (updated) setActiveWorkout(updated);
    } catch (error) {
      console.error('Error deleting exercise:', error);
    }
  };

  const handleDeleteSet = async (exerciseId: string, setId: string) => {
    if (!activeWorkout || !confirm('Satz löschen?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `/api/workouts/${activeWorkout.id}/exercises/${exerciseId}/sets/${setId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updated = await fetchWorkoutDetails(activeWorkout.id);
      if (updated) {
        setActiveWorkout(updated);
        if (activeExercise) {
          setActiveExercise(
            updated.exercises?.find((e: Exercise) => e.id === activeExercise.id) || null
          );
        }
      }
    } catch (error) {
      console.error('Error deleting set:', error);
    }
  };

  const handleFinishWorkout = () => {
    setTimerRunning(false);
    setActiveWorkout(null);
    setViewMode('list');
    fetchWorkouts();
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    if (!confirm('Workout wirklich löschen?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/workouts/${workoutId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchWorkouts();
    } catch (error) {
      console.error('Error deleting workout:', error);
    }
  };

  // ==================== CALCULATIONS ====================
  const calculateTotalVolume = (exercise: Exercise): number => {
    return exercise.sets.reduce((total, set) => {
      return total + (set.weight || 0) * set.reps;
    }, 0);
  };

  const getRPEColor = (rpe?: number): string => {
    if (!rpe) return TacticalStyles.colors.fgSubtle;
    if (rpe <= 3) return TacticalStyles.colors.success;
    if (rpe <= 6) return TacticalStyles.colors.warning;
    if (rpe <= 8) return TacticalStyles.colors.danger;
    return TacticalStyles.colors.danger;
  };

  // ==================== LOADING ====================
  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: TacticalStyles.colors.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p style={{ color: TacticalStyles.colors.fgMuted }}>LADE WORKOUT-DATEN...</p>
      </div>
    );
  }

  // ==================== ACTIVE WORKOUT VIEW ====================
  if (viewMode === 'active' && activeWorkout) {
    return (
      <AppLayout>
        <div
          style={{
            padding: '2rem 1rem',
            backgroundColor: TacticalStyles.colors.bg,
            minHeight: 'calc(100vh - 4rem)',
          }}
        >
          <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
            {/* Header mit Timer */}
            <div
              style={{
                backgroundColor: TacticalStyles.colors.card,
                border: `2px solid ${TacticalStyles.colors.accent}`,
                borderRadius: '0.5rem',
                padding: '2rem',
                marginBottom: '2rem',
                boxShadow: TacticalStyles.effects.glow,
              }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h1
                    style={{
                      ...TacticalStyles.typography.h1,
                      color: TacticalStyles.colors.accent,
                      marginBottom: '0.5rem',
                    }}
                  >
                    {activeWorkout.name}
                  </h1>
                  <p style={{ ...TacticalStyles.typography.bodyMono, color: TacticalStyles.colors.fgMuted }}>
                    {new Date(activeWorkout.date).toLocaleDateString('de-DE')}
                  </p>
                </div>
                <div className="text-right">
                  <div
                    style={{
                      fontSize: '3rem',
                      fontFamily: 'monospace',
                      fontWeight: '900',
                      color: TacticalStyles.colors.accent,
                      letterSpacing: '0.1em',
                    }}
                  >
                    {formatTimer(timer)}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <TacticalButton
                      variant="secondary"
                      onClick={() => setTimerRunning(!timerRunning)}
                    >
                      {timerRunning ? '⏸ PAUSE' : '▶ START'}
                    </TacticalButton>
                    <TacticalButton
                      variant="secondary"
                      onClick={() => {
                        setTimer(0);
                        setTimerRunning(false);
                      }}
                    >
                      🔄 RESET
                    </TacticalButton>
                  </div>
                </div>
              </div>
            </div>

            {/* Exercises */}
            {activeWorkout.exercises && activeWorkout.exercises.length > 0 ? (
              <div className="space-y-4">
                {activeWorkout.exercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    style={{
                      backgroundColor: TacticalStyles.colors.card,
                      border: TacticalStyles.borders.default,
                      borderRadius: '0.5rem',
                      padding: '1.5rem',
                    }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3
                          style={{
                            fontSize: '1.25rem',
                            fontWeight: '700',
                            color: TacticalStyles.colors.fg,
                            marginBottom: '0.5rem',
                          }}
                        >
                          {exercise.name}
                        </h3>
                        <p
                          style={{
                            ...TacticalStyles.typography.bodyMono,
                            color: TacticalStyles.colors.accent,
                          }}
                        >
                          VOLUMEN: {calculateTotalVolume(exercise).toFixed(1)} KG
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <TacticalButton
                          onClick={() => {
                            setActiveExercise(exercise);
                            setShowSetModal(true);
                          }}
                        >
                          + SATZ
                        </TacticalButton>
                        <TacticalButton
                          variant="danger"
                          onClick={() => handleDeleteExercise(exercise.id)}
                        >
                          🗑
                        </TacticalButton>
                      </div>
                    </div>

                    {/* Sets Table */}
                    {exercise.sets.length > 0 ? (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ backgroundColor: TacticalStyles.colors.cardHover }}>
                              <th style={TacticalHelpers.getTableHeader()}>SATZ</th>
                              <th style={TacticalHelpers.getTableHeader()}>WDH</th>
                              <th style={TacticalHelpers.getTableHeader()}>GEWICHT</th>
                              <th style={TacticalHelpers.getTableHeader()}>RPE</th>
                              <th style={TacticalHelpers.getTableHeader()}>VOLUMEN</th>
                              <th style={TacticalHelpers.getTableHeader()}>AKTION</th>
                            </tr>
                          </thead>
                          <tbody>
                            {exercise.sets.map((set, idx) => (
                              <tr
                                key={set.id}
                                style={{
                                  borderBottom: TacticalStyles.borders.subtle,
                                }}
                              >
                                <td style={TacticalHelpers.getTableCell()}>{idx + 1}</td>
                                <td style={TacticalHelpers.getTableCell()}>{set.reps}</td>
                                <td style={TacticalHelpers.getTableCell()}>
                                  {set.weight ? `${set.weight} KG` : '-'}
                                </td>
                                <td
                                  style={{
                                    ...TacticalHelpers.getTableCell(),
                                    color: getRPEColor(set.rpe),
                                    fontWeight: '700',
                                  }}
                                >
                                  {set.rpe || '-'}
                                </td>
                                <td style={TacticalHelpers.getTableCell()}>
                                  {set.weight ? `${(set.weight * set.reps).toFixed(1)} KG` : '-'}
                                </td>
                                <td style={TacticalHelpers.getTableCell()}>
                                  <TacticalButton
                                    variant="danger"
                                    onClick={() => handleDeleteSet(exercise.id, set.id)}
                                  >
                                    LÖSCHEN
                                  </TacticalButton>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p
                        style={{
                          textAlign: 'center',
                          padding: '2rem',
                          color: TacticalStyles.colors.fgSubtle,
                        }}
                      >
                        NOCH KEINE SÄTZE
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <TacticalEmptyState
                icon="🏋️"
                title="KEINE ÜBUNGEN"
                description="Füge deine erste Übung hinzu um mit dem Training zu beginnen."
                actionLabel="+ ÜBUNG HINZUFÜGEN"
                onAction={() => setShowExerciseModal(true)}
              />
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 mt-6">
              <TacticalButton fullWidth onClick={() => setShowExerciseModal(true)}>
                + ÜBUNG HINZUFÜGEN
              </TacticalButton>
              <TacticalButton variant="secondary" onClick={handleFinishWorkout}>
                ✓ WORKOUT BEENDEN
              </TacticalButton>
            </div>
          </div>

          {/* Exercise Modal */}
          <TacticalModal
            isOpen={showExerciseModal}
            onClose={() => {
              setShowExerciseModal(false);
              setExerciseName('');
            }}
            title="ÜBUNG HINZUFÜGEN"
          >
            <form onSubmit={handleAddExercise}>
              <input
                type="text"
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)}
                placeholder="z.B. Bankdrücken"
                required
                style={{
                  ...TacticalHelpers.getInputStyles(),
                  marginBottom: '1.5rem',
                }}
              />
              <div className="flex justify-end gap-2">
                <TacticalButton
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowExerciseModal(false);
                    setExerciseName('');
                  }}
                >
                  ABBRECHEN
                </TacticalButton>
                <TacticalButton type="submit">HINZUFÜGEN</TacticalButton>
              </div>
            </form>
          </TacticalModal>

          {/* Set Modal */}
          <TacticalModal
            isOpen={showSetModal}
            onClose={() => {
              setShowSetModal(false);
              setSetForm(emptySetForm);
            }}
            title={`SATZ HINZUFÜGEN - ${activeExercise?.name || ''}`}
          >
            <form onSubmit={handleAddSet}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={TacticalHelpers.getLabelStyles()}>WIEDERHOLUNGEN *</label>
                <input
                  type="number"
                  value={setForm.reps}
                  onChange={(e) => setSetForm({ ...setForm, reps: e.target.value })}
                  placeholder="z.B. 10"
                  required
                  style={TacticalHelpers.getInputStyles()}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={TacticalHelpers.getLabelStyles()}>GEWICHT (KG)</label>
                <input
                  type="number"
                  step="0.5"
                  value={setForm.weight}
                  onChange={(e) => setSetForm({ ...setForm, weight: e.target.value })}
                  placeholder="z.B. 80"
                  style={TacticalHelpers.getInputStyles()}
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={TacticalHelpers.getLabelStyles()}>RPE (1-10)</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={setForm.rpe}
                  onChange={(e) => setSetForm({ ...setForm, rpe: e.target.value })}
                  placeholder="1 = leicht, 10 = maximal"
                  style={TacticalHelpers.getInputStyles()}
                />
              </div>
              <div className="flex justify-end gap-2">
                <TacticalButton
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowSetModal(false);
                    setSetForm(emptySetForm);
                  }}
                >
                  ABBRECHEN
                </TacticalButton>
                <TacticalButton type="submit">HINZUFÜGEN</TacticalButton>
              </div>
            </form>
          </TacticalModal>
        </div>
      </AppLayout>
    );
  }

  // ==================== LIST VIEW ====================
  return (
    <AppLayout>
      <div
        style={{
          padding: '2rem 1rem',
          backgroundColor: TacticalStyles.colors.bg,
          minHeight: 'calc(100vh - 4rem)',
        }}
      >
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <TacticalHeader
            title="GYM TRACKER"
            subtitle="TRAININGSÜBERSICHT & WORKOUT-VERWALTUNG"
            actions={
              <TacticalButton onClick={() => setShowWorkoutModal(true)}>
                + NEUES WORKOUT
              </TacticalButton>
            }
          />

          {/* Quick Actions */}
          <TacticalSection title="SCHNELLZUGRIFF" markerColor="accent">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TacticalActionCard
                icon="⚡"
                title="QUICK START"
                description="Starte ein leeres Workout"
                onClick={() => setShowWorkoutModal(true)}
              />
              <TacticalActionCard
                icon="📋"
                title="TEMPLATES"
                description="Workout-Vorlagen (bald verfügbar)"
                onClick={() => alert('Feature kommt bald!')}
              />
              <TacticalActionCard
                icon="📊"
                title="STATISTIKEN"
                description="Trainingsfortschritt anzeigen"
                onClick={() => router.push('/body-metrics')}
              />
            </div>
          </TacticalSection>

          {/* Workouts List */}
          <TacticalSection title="WORKOUT-HISTORIE" markerColor="forest">
            {workouts.length === 0 ? (
              <TacticalEmptyState
                icon="🏋️"
                title="KEINE WORKOUTS"
                description="Du hast noch keine Workouts erstellt. Starte jetzt dein erstes Training und tracke deinen Fortschritt!"
                actionLabel="+ ERSTES WORKOUT ERSTELLEN"
                onAction={() => setShowWorkoutModal(true)}
              />
            ) : (
              <div className="space-y-3">
                {workouts.map((workout) => (
                  <div
                    key={workout.id}
                    style={{
                      backgroundColor: TacticalStyles.colors.card,
                      border: TacticalStyles.borders.default,
                      borderRadius: '0.5rem',
                      padding: '1.5rem',
                      transition: TacticalStyles.transitions.base,
                    }}
                    className="hover:scale-[1.01]"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = TacticalStyles.colors.cardHover;
                      e.currentTarget.style.boxShadow = TacticalStyles.effects.shadow;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = TacticalStyles.colors.card;
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3
                          style={{
                            fontSize: '1.25rem',
                            fontWeight: '700',
                            color: TacticalStyles.colors.fg,
                            marginBottom: '0.5rem',
                          }}
                        >
                          {workout.name}
                        </h3>
                        <p
                          style={{
                            ...TacticalStyles.typography.bodyMono,
                            color: TacticalStyles.colors.accent,
                          }}
                        >
                          {new Date(workout.date).toLocaleDateString('de-DE', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        {workout.notes && (
                          <p
                            style={{
                              marginTop: '0.5rem',
                              color: TacticalStyles.colors.fgMuted,
                              fontSize: '0.875rem',
                            }}
                          >
                            {workout.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <TacticalButton
                          variant="secondary"
                          onClick={() => handleStartExistingWorkout(workout)}
                        >
                          STARTEN
                        </TacticalButton>
                        <TacticalButton
                          variant="danger"
                          onClick={() => handleDeleteWorkout(workout.id)}
                        >
                          LÖSCHEN
                        </TacticalButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TacticalSection>

          {/* Workout Modal */}
          <TacticalModal
            isOpen={showWorkoutModal}
            onClose={() => {
              setShowWorkoutModal(false);
              setWorkoutForm({
                name: '',
                date: new Date().toISOString().split('T')[0],
                notes: '',
              });
            }}
            title="NEUES WORKOUT"
          >
            <form onSubmit={handleCreateWorkout}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={TacticalHelpers.getLabelStyles()}>NAME *</label>
                <input
                  type="text"
                  value={workoutForm.name}
                  onChange={(e) => setWorkoutForm({ ...workoutForm, name: e.target.value })}
                  placeholder="z.B. Push Day"
                  required
                  style={TacticalHelpers.getInputStyles()}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={TacticalHelpers.getLabelStyles()}>DATUM *</label>
                <input
                  type="date"
                  value={workoutForm.date}
                  onChange={(e) => setWorkoutForm({ ...workoutForm, date: e.target.value })}
                  required
                  style={TacticalHelpers.getInputStyles()}
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={TacticalHelpers.getLabelStyles()}>NOTIZEN</label>
                <textarea
                  value={workoutForm.notes}
                  onChange={(e) => setWorkoutForm({ ...workoutForm, notes: e.target.value })}
                  rows={3}
                  placeholder="Optionale Notizen..."
                  style={{
                    ...TacticalHelpers.getInputStyles(),
                    resize: 'vertical',
                    minHeight: '80px',
                  }}
                />
              </div>
              <div className="flex justify-end gap-2">
                <TacticalButton
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowWorkoutModal(false);
                    setWorkoutForm({
                      name: '',
                      date: new Date().toISOString().split('T')[0],
                      notes: '',
                    });
                  }}
                >
                  ABBRECHEN
                </TacticalButton>
                <TacticalButton type="submit">ERSTELLEN & STARTEN</TacticalButton>
              </div>
            </form>
          </TacticalModal>
        </div>
      </div>
    </AppLayout>
  );
}
