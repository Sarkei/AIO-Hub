'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import AppLayout from '@/components/AppLayout'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import { Card } from '@/components/ui/Card'

interface Set {
  id: string;
  exercise_id: string;
  reps: number;
  weight?: number;
  rpe?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface Exercise {
  id: string;
  workout_id: string;
  name: string;
  notes?: string;
  sets: Set[];
  created_at: string;
  updated_at: string;
}

interface Workout {
  id: string;
  name: string;
  date: string;
  notes?: string;
  exercises?: Exercise[];
  created_at: string;
  updated_at: string;
}

interface SetFormData {
  reps: string;
  weight: string;
  rpe: string;
  notes: string;
}

const emptySetForm: SetFormData = {
  reps: '',
  weight: '',
  rpe: '',
  notes: ''
};

export default function GymPage() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showSetModal, setShowSetModal] = useState(false);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'active'>('list');
  
  // Form States
  const [workoutForm, setWorkoutForm] = useState({ name: '', date: new Date().toISOString().split('T')[0], notes: '' });
  const [exerciseName, setExerciseName] = useState('');
  const [setForm, setSetForm] = useState<SetFormData>(emptySetForm);

  const fetchWorkouts = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await axios.get('/api/workouts', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setWorkouts(response.data.workouts || []);
    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
      } else {
        console.error('Error fetching workouts:', error);
        alert('Fehler beim Laden der Workouts');
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  // Timer Effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  

  const fetchWorkoutDetails = async (workoutId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/workouts/${workoutId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.workout;
    } catch (error) {
      console.error('Error fetching workout details:', error);
      return null;
    }
  };

  const handleCreateWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/workouts', workoutForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const newWorkout = response.data.workout;
      setShowWorkoutModal(false);
      setWorkoutForm({ name: '', date: new Date().toISOString().split('T')[0], notes: '' });
      
      // Direkt zum aktiven Workout wechseln
      const detailedWorkout = await fetchWorkoutDetails(newWorkout.id);
      if (detailedWorkout) {
        setActiveWorkout({ ...detailedWorkout, exercises: [] });
        setViewMode('active');
        setTimer(0);
        setTimerRunning(true);
      }
      
      fetchWorkouts();
    } catch (error: any) {
      console.error('Error creating workout:', error);
      alert(error.response?.data?.message || 'Fehler beim Erstellen');
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
      const payload: any = {
        reps: parseInt(setForm.reps)
      };
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
        setActiveExercise(updated.exercises.find((e: Exercise) => e.id === activeExercise.id) || null);
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
      await axios.delete(
        `/api/workouts/${activeWorkout.id}/exercises/${exerciseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updated = await fetchWorkoutDetails(activeWorkout.id);
      if (updated) setActiveWorkout(updated);
    } catch (error) {
      console.error('Error deleting exercise:', error);
      alert('Fehler beim Löschen');
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
          setActiveExercise(updated.exercises.find((e: Exercise) => e.id === activeExercise.id) || null);
        }
      }
    } catch (error) {
      console.error('Error deleting set:', error);
      alert('Fehler beim Löschen');
    }
  };

  const handleFinishWorkout = () => {
    setTimerRunning(false);
    setActiveWorkout(null);
    setViewMode('list');
    fetchWorkouts();
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

  const handleDeleteWorkout = async (workoutId: string) => {
    if (!confirm('Workout wirklich löschen?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/workouts/${workoutId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchWorkouts();
    } catch (error) {
      console.error('Error deleting workout:', error);
      alert('Fehler beim Löschen');
    }
  };

  const calculateTotalVolume = (exercise: Exercise): number => {
    return exercise.sets.reduce((total, set) => {
      return total + (set.weight || 0) * set.reps;
    }, 0);
  };

  const formatTimer = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getRPEColor = (rpe?: number): string => {
    if (!rpe) return 'text-gray-400';
    if (rpe <= 3) return 'text-green-500';
    if (rpe <= 6) return 'text-yellow-500';
    if (rpe <= 8) return 'text-orange-500';
    return 'text-red-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg text-gray-600">Lade Gym-Daten...</p>
      </div>
    );
  }

  // Active Workout View
  if (viewMode === 'active' && activeWorkout) {
    return (
      <AppLayout>
      <div className="py-8 px-4 bg-[rgb(var(--bg))]">
        <div className="max-w-5xl mx-auto">
          {/* Header mit Timer */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">{activeWorkout.name}</h1>
                <p className="text-blue-100 mt-1">
                  {new Date(activeWorkout.date).toLocaleDateString('de-DE')}
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-mono font-bold">{formatTimer(timer)}</div>
                <div className="flex gap-2 mt-2">
                  <Button variant="secondary" size="sm" onClick={() => setTimerRunning(!timerRunning)}>
                    {timerRunning ? '⏸ Pause' : '▶ Start'}
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => { setTimer(0); setTimerRunning(false); }}>
                    🔄 Reset
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Exercises */}
          <div className="space-y-4">
            {activeWorkout.exercises?.map((exercise) => (
              <Card key={exercise.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{exercise.name}</h3>
                    <p className="text-sm text-[rgb(var(--fg-subtle))]">
                      Volumen: {calculateTotalVolume(exercise).toFixed(1)} kg
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => { setActiveExercise(exercise); setShowSetModal(true); }}>+ Satz</Button>
                    <Button size="sm" variant="danger" onClick={() => handleDeleteExercise(exercise.id)}>🗑</Button>
                  </div>
                </div>

                {/* Sets Table */}
                {exercise.sets.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[rgb(var(--bg-elevated))]">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-[rgb(var(--fg-subtle))]">Satz</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Wdh.</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Gewicht</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">RPE</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Volumen</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Aktion</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y" style={{ borderColor: 'rgb(var(--card-border))' }}>
                        {exercise.sets.map((set, idx) => (
                          <tr key={set.id} className="hover:bg-[rgb(var(--bg-elevated))]">
                            <td className="px-4 py-3 text-sm font-medium">{idx + 1}</td>
                            <td className="px-4 py-3 text-sm text-[rgb(var(--fg-muted))]">{set.reps}</td>
                            <td className="px-4 py-3 text-sm text-[rgb(var(--fg-muted))]">
                              {set.weight ? `${set.weight} kg` : '-'}
                            </td>
                            <td className={`px-4 py-3 text-sm font-medium ${getRPEColor(set.rpe)}`}>
                              {set.rpe || '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-[rgb(var(--fg-muted))]">
                              {set.weight ? `${(set.weight * set.reps).toFixed(1)} kg` : '-'}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <Button size="sm" variant="danger" onClick={() => handleDeleteSet(exercise.id, set.id)}>Löschen</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-[rgb(var(--fg-subtle))] text-center py-4">Noch keine Sätze</p>
                )}
              </Card>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            <Button className="flex-1" onClick={() => setShowExerciseModal(true)}>+ Übung hinzufügen</Button>
            <Button variant="secondary" onClick={handleFinishWorkout}>✓ Workout beenden</Button>
          </div>
        </div>

        {/* Exercise Modal */}
        {showExerciseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="card max-w-md w-full p-6" role="dialog" aria-modal="true" aria-labelledby="exercise-modal-title">
              <h2 id="exercise-modal-title" className="text-2xl font-bold mb-4">Übung hinzufügen</h2>
              <form onSubmit={handleAddExercise}>
                <Input type="text" value={exerciseName} onChange={(e) => setExerciseName(e.target.value)} className="mb-4" placeholder="z.B. Bankdrücken" required />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="secondary" onClick={() => { setShowExerciseModal(false); setExerciseName(''); }}>Abbrechen</Button>
                  <Button type="submit">Hinzufügen</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Set Modal */}
        {showSetModal && activeExercise && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="card max-w-md w-full p-6" role="dialog" aria-modal="true" aria-labelledby="set-modal-title">
              <h2 id="set-modal-title" className="text-2xl font-bold mb-4">Satz hinzufügen - {activeExercise.name}</h2>
              <form onSubmit={handleAddSet}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Wiederholungen *
                  </label>
                  <Input type="number" value={setForm.reps} onChange={(e) => setSetForm({ ...setForm, reps: e.target.value })} placeholder="z.B. 10" required />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gewicht (kg)
                  </label>
                  <Input type="number" step="0.5" value={setForm.weight} onChange={(e) => setSetForm({ ...setForm, weight: e.target.value })} placeholder="z.B. 80" />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    RPE (1-10) - Rate of Perceived Exertion
                  </label>
                  <Input type="number" min={1} max={10} value={setForm.rpe} onChange={(e) => setSetForm({ ...setForm, rpe: e.target.value })} placeholder="1 = sehr leicht, 10 = maximale Anstrengung" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="secondary" onClick={() => { setShowSetModal(false); setSetForm(emptySetForm); }}>Abbrechen</Button>
                  <Button type="submit">Hinzufügen</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      </AppLayout>
    );
  }

  // List View
  return (
    <AppLayout>
    <div className="py-8 px-4 bg-[rgb(var(--bg))]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">💪 Gym Tracker</h1>
            <p className="text-gray-600 mt-1">Tracke deine Workouts</p>
          </div>
          <Button onClick={() => setShowWorkoutModal(true)}>+ Neues Workout</Button>
        </div>

        {/* Workouts List */}
        <Card className="overflow-hidden">
          {workouts.length === 0 ? (
            <div className="p-8 text-center text-[rgb(var(--fg-subtle))]">
              Noch keine Workouts. Erstelle dein erstes Workout!
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'rgb(var(--card-border))' }}>
              {workouts.map((workout) => (
                <div key={workout.id} className="p-6 hover:bg-[rgb(var(--bg-elevated))] transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{workout.name}</h3>
                      <p className="text-sm text-[rgb(var(--fg-subtle))] mt-1">
                        {new Date(workout.date).toLocaleDateString('de-DE', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      {workout.notes && (
                        <p className="text-sm text-[rgb(var(--fg-muted))] mt-2">{workout.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="secondary" onClick={() => handleStartExistingWorkout(workout)}>Starten</Button>
                      <Button variant="danger" onClick={() => handleDeleteWorkout(workout.id)}>Löschen</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Workout Modal */}
        {showWorkoutModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="card max-w-md w-full p-6" role="dialog" aria-modal="true" aria-labelledby="workout-modal-title">
              <h2 id="workout-modal-title" className="text-2xl font-bold mb-4">Neues Workout</h2>
              <form onSubmit={handleCreateWorkout}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <Input type="text" value={workoutForm.name} onChange={(e) => setWorkoutForm({ ...workoutForm, name: e.target.value })} placeholder="z.B. Push Day" required />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Datum *
                  </label>
                  <Input type="date" value={workoutForm.date} onChange={(e) => setWorkoutForm({ ...workoutForm, date: e.target.value })} required />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notizen
                  </label>
                  <Textarea value={workoutForm.notes} onChange={(e) => setWorkoutForm({ ...workoutForm, notes: e.target.value })} rows={3} placeholder="Optionale Notizen..." />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="secondary" onClick={() => { setShowWorkoutModal(false); setWorkoutForm({ name: '', date: new Date().toISOString().split('T')[0], notes: '' }); }}>Abbrechen</Button>
                  <Button type="submit">Erstellen & Starten</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
    </AppLayout>
  );
}
