'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

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

  useEffect(() => {
    fetchWorkouts();
  }, []);

  // Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const fetchWorkouts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await axios.get('http://localhost:4000/api/workouts', {
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
  };

  const fetchWorkoutDetails = async (workoutId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:4000/api/workouts/${workoutId}`, {
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
      const response = await axios.post('http://localhost:4000/api/workouts', workoutForm, {
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
        `http://localhost:4000/api/workouts/${activeWorkout.id}/exercises`,
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
        `http://localhost:4000/api/workouts/${activeWorkout.id}/exercises/${activeExercise.id}/sets`,
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
        `http://localhost:4000/api/workouts/${activeWorkout.id}/exercises/${exerciseId}`,
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
        `http://localhost:4000/api/workouts/${activeWorkout.id}/exercises/${exerciseId}/sets/${setId}`,
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
      await axios.delete(`http://localhost:4000/api/workouts/${workoutId}`, {
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
      <div className="min-h-screen bg-gray-50 py-8 px-4">
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
                  <button
                    onClick={() => setTimerRunning(!timerRunning)}
                    className="px-4 py-1 bg-white text-blue-600 rounded hover:bg-blue-50 text-sm"
                  >
                    {timerRunning ? '⏸ Pause' : '▶ Start'}
                  </button>
                  <button
                    onClick={() => { setTimer(0); setTimerRunning(false); }}
                    className="px-4 py-1 bg-white text-blue-600 rounded hover:bg-blue-50 text-sm"
                  >
                    🔄 Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Exercises */}
          <div className="space-y-4">
            {activeWorkout.exercises?.map((exercise) => (
              <div key={exercise.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{exercise.name}</h3>
                    <p className="text-sm text-gray-500">
                      Volumen: {calculateTotalVolume(exercise).toFixed(1)} kg
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setActiveExercise(exercise);
                        setShowSetModal(true);
                      }}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    >
                      + Satz
                    </button>
                    <button
                      onClick={() => handleDeleteExercise(exercise.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                    >
                      🗑
                    </button>
                  </div>
                </div>

                {/* Sets Table */}
                {exercise.sets.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Satz</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Wdh.</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Gewicht</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">RPE</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Volumen</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Aktion</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {exercise.sets.map((set, idx) => (
                          <tr key={set.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{idx + 1}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{set.reps}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {set.weight ? `${set.weight} kg` : '-'}
                            </td>
                            <td className={`px-4 py-3 text-sm font-medium ${getRPEColor(set.rpe)}`}>
                              {set.rpe || '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {set.weight ? `${(set.weight * set.reps).toFixed(1)} kg` : '-'}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <button
                                onClick={() => handleDeleteSet(exercise.id, set.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Löschen
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Noch keine Sätze</p>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setShowExerciseModal(true)}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              + Übung hinzufügen
            </button>
            <button
              onClick={handleFinishWorkout}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              ✓ Workout beenden
            </button>
          </div>
        </div>

        {/* Exercise Modal */}
        {showExerciseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-4">Übung hinzufügen</h2>
              <form onSubmit={handleAddExercise}>
                <input
                  type="text"
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
                  placeholder="z.B. Bankdrücken"
                  required
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => { setShowExerciseModal(false); setExerciseName(''); }}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Hinzufügen
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Set Modal */}
        {showSetModal && activeExercise && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-4">Satz hinzufügen - {activeExercise.name}</h2>
              <form onSubmit={handleAddSet}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Wiederholungen *
                  </label>
                  <input
                    type="number"
                    value={setForm.reps}
                    onChange={(e) => setSetForm({ ...setForm, reps: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="z.B. 10"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gewicht (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={setForm.weight}
                    onChange={(e) => setSetForm({ ...setForm, weight: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="z.B. 80"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    RPE (1-10) - Rate of Perceived Exertion
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={setForm.rpe}
                    onChange={(e) => setSetForm({ ...setForm, rpe: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="1 = sehr leicht, 10 = maximale Anstrengung"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => { setShowSetModal(false); setSetForm(emptySetForm); }}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Hinzufügen
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // List View
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">💪 Gym Tracker</h1>
            <p className="text-gray-600 mt-1">Tracke deine Workouts</p>
          </div>
          <button
            onClick={() => setShowWorkoutModal(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + Neues Workout
          </button>
        </div>

        {/* Workouts List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {workouts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Noch keine Workouts. Erstelle dein erstes Workout!
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {workouts.map((workout) => (
                <div key={workout.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">{workout.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(workout.date).toLocaleDateString('de-DE', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      {workout.notes && (
                        <p className="text-sm text-gray-600 mt-2">{workout.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStartExistingWorkout(workout)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Starten
                      </button>
                      <button
                        onClick={() => handleDeleteWorkout(workout.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Löschen
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Workout Modal */}
        {showWorkoutModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-4">Neues Workout</h2>
              <form onSubmit={handleCreateWorkout}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={workoutForm.name}
                    onChange={(e) => setWorkoutForm({ ...workoutForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="z.B. Push Day"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Datum *
                  </label>
                  <input
                    type="date"
                    value={workoutForm.date}
                    onChange={(e) => setWorkoutForm({ ...workoutForm, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notizen
                  </label>
                  <textarea
                    value={workoutForm.notes}
                    onChange={(e) => setWorkoutForm({ ...workoutForm, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                    placeholder="Optionale Notizen..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowWorkoutModal(false);
                      setWorkoutForm({ name: '', date: new Date().toISOString().split('T')[0], notes: '' });
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Erstellen & Starten
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
