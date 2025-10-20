'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface NutritionProfile {
  id: string;
  goal: 'LOSE_WEIGHT' | 'MAINTAIN' | 'GAIN_WEIGHT';
  diet_type: 'STANDARD' | 'HIGH_PROTEIN' | 'KETO' | 'VEGETARIAN' | 'VEGAN';
  target_calories: number;
  target_protein?: number;
  target_carbs?: number;
  target_fat?: number;
}

interface NutritionLog {
  id: string;
  date: string;
  meal_type: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  food_name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  notes?: string;
}

type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

interface Stats {
  today: {
    total_calories: number;
    total_protein: number;
    total_carbs: number;
    total_fat: number;
  };
  week: {
    total_calories: number;
    total_protein: number;
    total_carbs: number;
    total_fat: number;
  };
  profile: NutritionProfile | null;
}

export default function NutritionPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<NutritionProfile | null>(null);
  const [logs, setLogs] = useState<NutritionLog[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Forms
  const [profileForm, setProfileForm] = useState({
    goal: 'MAINTAIN' as const,
    dietType: 'STANDARD' as const,
    targetCalories: 2000,
    targetProtein: 150,
    targetCarbs: 200,
    targetFat: 70
  });

  const [logForm, setLogForm] = useState<{ 
    date: string;
    mealType: MealType;
    foodName: string;
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
    notes: string;
  }>({
    date: new Date().toISOString().split('T')[0],
    mealType: 'BREAKFAST',
    foodName: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Profile laden
      try {
        const profileRes = await axios.get('/api/nutrition/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(profileRes.data.profile);
        setProfileForm({
          goal: profileRes.data.profile.goal,
          dietType: profileRes.data.profile.diet_type,
          targetCalories: profileRes.data.profile.target_calories,
          targetProtein: profileRes.data.profile.target_protein || 0,
          targetCarbs: profileRes.data.profile.target_carbs || 0,
          targetFat: profileRes.data.profile.target_fat || 0
        });
      } catch (err: any) {
        if (err.response?.status === 404) {
          setShowProfileModal(true);
        }
      }

      // Logs laden (für ausgewähltes Datum)
      const logsRes = await axios.get(
        `/api/nutrition/logs?startDate=${selectedDate}&endDate=${selectedDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLogs(logsRes.data.logs || []);

      // Stats laden
      const statsRes = await axios.get('/api/nutrition/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(statsRes.data);

    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
      } else {
        console.error('Error fetching nutrition data:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/nutrition/profile',
        {
          goal: profileForm.goal,
          dietType: profileForm.dietType,
          targetCalories: parseInt(profileForm.targetCalories.toString()),
          targetProtein: profileForm.targetProtein ? parseFloat(profileForm.targetProtein.toString()) : null,
          targetCarbs: profileForm.targetCarbs ? parseFloat(profileForm.targetCarbs.toString()) : null,
          targetFat: profileForm.targetFat ? parseFloat(profileForm.targetFat.toString()) : null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowProfileModal(false);
      fetchData();
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Fehler beim Speichern des Profils');
    }
  };

  const handleSaveLog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload: any = {
        date: logForm.date,
        mealType: logForm.mealType,
        foodName: logForm.foodName,
        calories: parseInt(logForm.calories)
      };
      if (logForm.protein) payload.protein = parseFloat(logForm.protein);
      if (logForm.carbs) payload.carbs = parseFloat(logForm.carbs);
      if (logForm.fat) payload.fat = parseFloat(logForm.fat);
      if (logForm.notes) payload.notes = logForm.notes;

      if (editingLogId) {
        await axios.put(`/api/nutrition/logs/${editingLogId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/nutrition/logs', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setShowLogModal(false);
      setEditingLogId(null);
      setLogForm({
        date: new Date().toISOString().split('T')[0],
        mealType: 'BREAKFAST',
        foodName: '',
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        notes: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error saving log:', error);
      alert('Fehler beim Speichern');
    }
  };

  const handleEditLog = (log: NutritionLog) => {
    setEditingLogId(log.id);
    setLogForm({
      date: log.date,
      mealType: log.meal_type as MealType,
      foodName: log.food_name,
      calories: log.calories.toString(),
      protein: log.protein?.toString() || '',
      carbs: log.carbs?.toString() || '',
      fat: log.fat?.toString() || '',
      notes: log.notes || ''
    });
    setShowLogModal(true);
  };

  const handleDeleteLog = async (id: string) => {
    if (!confirm('Eintrag löschen?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/nutrition/logs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (error) {
      console.error('Error deleting log:', error);
      alert('Fehler beim Löschen');
    }
  };

  const getMealIcon = (mealType: string): string => {
    switch (mealType) {
      case 'BREAKFAST': return '🌅';
      case 'LUNCH': return '🍱';
      case 'DINNER': return '🍽️';
      case 'SNACK': return '🍎';
      default: return '🍴';
    }
  };

  const getMealLabel = (mealType: string): string => {
    switch (mealType) {
      case 'BREAKFAST': return 'Frühstück';
      case 'LUNCH': return 'Mittagessen';
      case 'DINNER': return 'Abendessen';
      case 'SNACK': return 'Snack';
      default: return mealType;
    }
  };

  const getGoalLabel = (goal: string): string => {
    switch (goal) {
      case 'LOSE_WEIGHT': return 'Abnehmen';
      case 'MAINTAIN': return 'Halten';
      case 'GAIN_WEIGHT': return 'Zunehmen';
      default: return goal;
    }
  };

  const calculateProgress = (current: number, target: number): number => {
    return Math.min((current / target) * 100, 100);
  };

  const getProgressColor = (current: number, target: number): string => {
    const percentage = (current / target) * 100;
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Makro-Verteilung für Chart
  const getMacroChartData = () => {
    if (!stats) return [];
    const { total_protein, total_carbs, total_fat } = stats.today;
    return [
      { name: 'Protein', value: total_protein * 4, color: '#3b82f6' },
      { name: 'Kohlenhydrate', value: total_carbs * 4, color: '#10b981' },
      { name: 'Fett', value: total_fat * 9, color: '#f59e0b' }
    ].filter(item => item.value > 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg text-gray-600">Lade Ernährungsdaten...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🍽️ Ernährungstracker</h1>
            <p className="text-gray-600 mt-1">Tracke deine Mahlzeiten & Kalorien</p>
          </div>
          <div className="flex gap-2">
            {profile && (
              <button
                onClick={() => setShowProfileModal(true)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                ⚙️ Profil
              </button>
            )}
            <button
              onClick={() => {
                setEditingLogId(null);
                setLogForm({
                  date: selectedDate,
                  mealType: 'BREAKFAST',
                  foodName: '',
                  calories: '',
                  protein: '',
                  carbs: '',
                  fat: '',
                  notes: ''
                });
                setShowLogModal(true);
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + Mahlzeit hinzufügen
            </button>
          </div>
        </div>

        {/* Datum Auswahl */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center gap-4">
            <label className="font-medium text-gray-700">Datum:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
            >
              Heute
            </button>
          </div>
        </div>

        {/* Statistiken & Progress */}
        {stats && stats.profile && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Kalorien Progress */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Kalorien Heute</h3>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stats.today.total_calories}
                    <span className="text-lg text-gray-500"> / {stats.profile.target_calories}</span>
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Ziel: {getGoalLabel(stats.profile.goal)}
                  </p>
                </div>
                <span className="text-4xl">🔥</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${getProgressColor(stats.today.total_calories, stats.profile.target_calories)}`}
                  style={{ width: `${calculateProgress(stats.today.total_calories, stats.profile.target_calories)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {Math.round(calculateProgress(stats.today.total_calories, stats.profile.target_calories))}% erreicht
              </p>
            </div>

            {/* Makros */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-4">Makronährstoffe Heute</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">💪 Protein</span>
                    <span className="font-medium">{stats.today.total_protein}g / {stats.profile.target_protein}g</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${calculateProgress(stats.today.total_protein, stats.profile.target_protein || 1)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">🌾 Kohlenhydrate</span>
                    <span className="font-medium">{stats.today.total_carbs}g / {stats.profile.target_carbs}g</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${calculateProgress(stats.today.total_carbs, stats.profile.target_carbs || 1)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">🥑 Fett</span>
                    <span className="font-medium">{stats.today.total_fat}g / {stats.profile.target_fat}g</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: `${calculateProgress(stats.today.total_fat, stats.profile.target_fat || 1)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Makro Verteilung Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-4">Makro-Verteilung</h3>
              {getMacroChartData().length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={getMacroChartData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {getMacroChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${Math.round(value)} kcal`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-center py-8">Noch keine Daten</p>
              )}
            </div>
          </div>
        )}

        {/* Mahlzeiten Log */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Mahlzeiten - {new Date(selectedDate).toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
            </h2>
          </div>

          {logs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Noch keine Mahlzeiten für dieses Datum eingetragen.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {logs.map((log) => (
                <div key={log.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{getMealIcon(log.meal_type)}</span>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{log.food_name}</h3>
                          <p className="text-sm text-gray-500">{getMealLabel(log.meal_type)}</p>
                        </div>
                      </div>
                      <div className="flex gap-6 text-sm text-gray-600 mt-3">
                        <span className="font-medium">🔥 {log.calories} kcal</span>
                        {log.protein && <span>💪 {log.protein}g Protein</span>}
                        {log.carbs && <span>🌾 {log.carbs}g Carbs</span>}
                        {log.fat && <span>🥑 {log.fat}g Fett</span>}
                      </div>
                      {log.notes && (
                        <p className="text-sm text-gray-500 mt-2 italic">{log.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditLog(log)}
                        className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        Bearbeiten
                      </button>
                      <button
                        onClick={() => handleDeleteLog(log.id)}
                        className="px-3 py-1 text-red-600 hover:bg-red-50 rounded"
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

        {/* Profile Modal */}
        {showProfileModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Ernährungsprofil</h2>
              <form onSubmit={handleSaveProfile}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ziel *</label>
                    <select
                      value={profileForm.goal}
                      onChange={(e) => setProfileForm({ ...profileForm, goal: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      required
                    >
                      <option value="LOSE_WEIGHT">Abnehmen</option>
                      <option value="MAINTAIN">Gewicht halten</option>
                      <option value="GAIN_WEIGHT">Zunehmen</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ernährungsform *</label>
                    <select
                      value={profileForm.dietType}
                      onChange={(e) => setProfileForm({ ...profileForm, dietType: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      required
                    >
                      <option value="STANDARD">Standard</option>
                      <option value="HIGH_PROTEIN">High Protein</option>
                      <option value="KETO">Keto</option>
                      <option value="VEGETARIAN">Vegetarisch</option>
                      <option value="VEGAN">Vegan</option>
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ziel-Kalorien pro Tag *</label>
                  <input
                    type="number"
                    value={profileForm.targetCalories}
                    onChange={(e) => setProfileForm({ ...profileForm, targetCalories: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                    min="500"
                    max="10000"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Protein (g)</label>
                    <input
                      type="number"
                      value={profileForm.targetProtein}
                      onChange={(e) => setProfileForm({ ...profileForm, targetProtein: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kohlenhydrate (g)</label>
                    <input
                      type="number"
                      value={profileForm.targetCarbs}
                      onChange={(e) => setProfileForm({ ...profileForm, targetCarbs: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fett (g)</label>
                    <input
                      type="number"
                      value={profileForm.targetFat}
                      onChange={(e) => setProfileForm({ ...profileForm, targetFat: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      min="0"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  {profile && (
                    <button
                      type="button"
                      onClick={() => setShowProfileModal(false)}
                      className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Abbrechen
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Speichern
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Log Modal */}
        {showLogModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">{editingLogId ? 'Mahlzeit bearbeiten' : 'Mahlzeit hinzufügen'}</h2>
              <form onSubmit={handleSaveLog}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Datum *</label>
                    <input
                      type="date"
                      value={logForm.date}
                      onChange={(e) => setLogForm({ ...logForm, date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mahlzeit *</label>
                    <select
                      value={logForm.mealType}
                      onChange={(e) => setLogForm({ ...logForm, mealType: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      required
                    >
                      <option value="BREAKFAST">Frühstück</option>
                      <option value="LUNCH">Mittagessen</option>
                      <option value="DINNER">Abendessen</option>
                      <option value="SNACK">Snack</option>
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lebensmittel *</label>
                  <input
                    type="text"
                    value={logForm.foodName}
                    onChange={(e) => setLogForm({ ...logForm, foodName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="z.B. Haferflocken mit Banane"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kalorien *</label>
                    <input
                      type="number"
                      value={logForm.calories}
                      onChange={(e) => setLogForm({ ...logForm, calories: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="z.B. 350"
                      required
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Protein (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={logForm.protein}
                      onChange={(e) => setLogForm({ ...logForm, protein: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="z.B. 15"
                      min="0"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kohlenhydrate (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={logForm.carbs}
                      onChange={(e) => setLogForm({ ...logForm, carbs: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="z.B. 60"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fett (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={logForm.fat}
                      onChange={(e) => setLogForm({ ...logForm, fat: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="z.B. 8"
                      min="0"
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
                  <textarea
                    value={logForm.notes}
                    onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows={2}
                    placeholder="Optionale Notizen..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowLogModal(false);
                      setEditingLogId(null);
                      setLogForm({
                        date: new Date().toISOString().split('T')[0],
                        mealType: 'BREAKFAST',
                        foodName: '',
                        calories: '',
                        protein: '',
                        carbs: '',
                        fat: '',
                        notes: ''
                      });
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingLogId ? 'Aktualisieren' : 'Hinzufügen'}
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
