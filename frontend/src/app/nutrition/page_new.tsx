'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import AppLayout from '@/components/AppLayout'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'

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

interface BodyData {
  weight: number;
  height: number;
}

// Kalorien-Berechnungs-Formeln (Mifflin-St Jeor Equation)
const calculateBMR = (weight: number, height: number, age: number = 30, gender: 'male' | 'female' = 'male'): number => {
  // BMR = 10 × Gewicht(kg) + 6.25 × Größe(cm) − 5 × Alter(Jahre) + s
  // s = +5 für Männer, -161 für Frauen
  const s = gender === 'male' ? 5 : -161;
  return Math.round(10 * weight + 6.25 * height - 5 * age + s);
};

const calculateMaintenanceCalories = (bmr: number, activityLevel: number = 1.55): number => {
  // 1.2 = sedentär, 1.375 = leicht aktiv, 1.55 = moderat aktiv, 1.725 = sehr aktiv, 1.9 = extrem aktiv
  return Math.round(bmr * activityLevel);
};

const calculateMacros = (
  calories: number,
  dietType: 'STANDARD' | 'HIGH_PROTEIN' | 'KETO' | 'LOW_CARB' | 'BALANCED'
): { protein: number; carbs: number; fat: number } => {
  let proteinPercent = 0.30;
  let carbsPercent = 0.40;
  let fatPercent = 0.30;

  switch (dietType) {
    case 'HIGH_PROTEIN':
      proteinPercent = 0.40;
      carbsPercent = 0.30;
      fatPercent = 0.30;
      break;
    case 'KETO':
      proteinPercent = 0.25;
      carbsPercent = 0.05;
      fatPercent = 0.70;
      break;
    case 'LOW_CARB':
      proteinPercent = 0.35;
      carbsPercent = 0.20;
      fatPercent = 0.45;
      break;
    case 'BALANCED':
      proteinPercent = 0.30;
      carbsPercent = 0.40;
      fatPercent = 0.30;
      break;
    default: // STANDARD
      proteinPercent = 0.30;
      carbsPercent = 0.40;
      fatPercent = 0.30;
  }

  return {
    protein: Math.round((calories * proteinPercent) / 4), // 1g Protein = 4 kcal
    carbs: Math.round((calories * carbsPercent) / 4), // 1g Carbs = 4 kcal
    fat: Math.round((calories * fatPercent) / 9) // 1g Fett = 9 kcal
  };
};

export default function NutritionPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<NutritionProfile | null>(null);
  const [logs, setLogs] = useState<NutritionLog[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showBodyDataPopup, setShowBodyDataPopup] = useState(false);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Body Data für Berechnung
  const [bodyData, setBodyData] = useState<BodyData | null>(null);
  const [tempWeight, setTempWeight] = useState('');
  const [tempHeight, setTempHeight] = useState('');

  // Profile Form mit Dropdowns
  const [goalType, setGoalType] = useState<'LOSE_WEIGHT' | 'MAINTAIN' | 'GAIN_WEIGHT'>('MAINTAIN');
  const [dietType, setDietType] = useState<'STANDARD' | 'HIGH_PROTEIN' | 'KETO' | 'LOW_CARB' | 'BALANCED'>('BALANCED');
  const [calculatedCalories, setCalculatedCalories] = useState(2000);
  const [calculatedMacros, setCalculatedMacros] = useState({ protein: 150, carbs: 200, fat: 67 });

  // Forms
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

  // Körperdaten aus Body Metrics laden
  const fetchBodyMetrics = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('/api/body-metrics', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const metrics = response.data.metrics || [];
      if (metrics.length > 0) {
        const latest = metrics[0]; // Neueste zuerst
        // Height ist nicht im Schema, daher verwenden wir localStorage als Fallback
        const storedHeight = localStorage.getItem('userHeight');
        
        if (latest.weight) {
          if (storedHeight) {
            setBodyData({
              weight: latest.weight,
              height: parseFloat(storedHeight)
            });
          } else {
            // Nur Gewicht vorhanden, Größe fehlt
            setTempWeight(latest.weight.toString());
            setShowBodyDataPopup(true);
          }
        } else {
          // Keine Körperdaten vorhanden
          setShowBodyDataPopup(true);
        }
      } else {
        // Keine Body Metrics vorhanden
        setShowBodyDataPopup(true);
      }
    } catch (error) {
      console.error('Error fetching body metrics:', error);
      setShowBodyDataPopup(true);
    }
  }, []);

  const fetchData = useCallback(async () => {
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
        setGoalType(profileRes.data.profile.goal);
        setDietType(profileRes.data.profile.diet_type);
      } catch (err: any) {
        if (err.response?.status === 404) {
          // Kein Profil vorhanden, Körperdaten prüfen
          await fetchBodyMetrics();
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
  }, [router, selectedDate, fetchBodyMetrics]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Berechnungen bei Änderung von Goal/Diet
  useEffect(() => {
    if (bodyData) {
      const bmr = calculateBMR(bodyData.weight, bodyData.height);
      let maintenanceCalories = calculateMaintenanceCalories(bmr);

      // Anpassung basierend auf Ziel
      let targetCalories = maintenanceCalories;
      if (goalType === 'LOSE_WEIGHT') {
        targetCalories = maintenanceCalories - 500; // 500 kcal Defizit
      } else if (goalType === 'GAIN_WEIGHT') {
        targetCalories = maintenanceCalories + 300; // 300 kcal Überschuss
      }

      setCalculatedCalories(targetCalories);
      setCalculatedMacros(calculateMacros(targetCalories, dietType));
    }
  }, [bodyData, goalType, dietType]);

  const handleSaveBodyData = () => {
    const weight = parseFloat(tempWeight);
    const height = parseFloat(tempHeight);

    if (isNaN(weight) || isNaN(height) || weight <= 0 || height <= 0) {
      alert('Bitte gültige Werte eingeben');
      return;
    }

    // Speichere Größe im localStorage (da nicht in DB Schema)
    localStorage.setItem('userHeight', height.toString());
    
    setBodyData({ weight, height });
    setShowBodyDataPopup(false);
    setShowProfileModal(true); // Zeige direkt Profil-Modal
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/nutrition/profile',
        {
          goal: goalType,
          dietType: dietType,
          targetCalories: calculatedCalories,
          targetProtein: calculatedMacros.protein,
          targetCarbs: calculatedMacros.carbs,
          targetFat: calculatedMacros.fat
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

  const getDietTypeLabel = (diet: string): string => {
    switch (diet) {
      case 'HIGH_PROTEIN': return 'High Protein';
      case 'KETO': return 'Keto';
      case 'LOW_CARB': return 'Low Carb';
      case 'BALANCED': return 'Balanced';
      default: return 'Standard';
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
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--bg))]">
        <p className="text-lg text-[rgb(var(--fg-muted))]" role="status" aria-live="polite">Lade Ernährungsdaten...</p>
      </div>
    );
  }

  return (
    <AppLayout>
    <div className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">🍽️ Ernährungstracker</h1>
            <p className="text-[rgb(var(--fg-muted))] mt-1">Tracke deine Mahlzeiten & Kalorien</p>
          </div>
          <div className="flex gap-2">
            {profile && (
              <Button variant="secondary" onClick={() => setShowProfileModal(true)} aria-label="Ernährungsprofil öffnen">
                ⚙️ Profil
              </Button>
            )}
            <Button
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
              aria-label="Mahlzeit hinzufügen"
            >
              + Mahlzeit hinzufügen
            </Button>
          </div>
        </div>

        {/* Goal & Diet Selection - PROMINENT */}
        {profile && (
          <Card className="p-6 mb-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                  <span>🎯</span>
                  <span>Dein Ziel</span>
                </label>
                <Select 
                  value={goalType} 
                  onChange={(e) => {
                    const newGoal = e.target.value as typeof goalType;
                    setGoalType(newGoal);
                    handleSaveProfile();
                  }}
                  className="text-lg font-medium"
                >
                  <option value="LOSE_WEIGHT">📉 Abnehmen (-500 kcal)</option>
                  <option value="MAINTAIN">⚖️ Gewicht halten</option>
                  <option value="GAIN_WEIGHT">📈 Zunehmen (+300 kcal)</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                  <span>🍴</span>
                  <span>Ernährungsform</span>
                </label>
                <Select 
                  value={dietType} 
                  onChange={(e) => {
                    const newDiet = e.target.value as typeof dietType;
                    setDietType(newDiet);
                    handleSaveProfile();
                  }}
                  className="text-lg font-medium"
                >
                  <option value="BALANCED">⚖️ Balanced (30/40/30)</option>
                  <option value="HIGH_PROTEIN">💪 High Protein (40/30/30)</option>
                  <option value="LOW_CARB">🥑 Low Carb (35/20/45)</option>
                  <option value="KETO">🔥 Keto (25/5/70)</option>
                  <option value="STANDARD">📊 Standard (30/40/30)</option>
                </Select>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-[rgb(var(--fg-subtle))]">
                Dein Kalorienziel passt sich automatisch an: <strong>{calculatedCalories} kcal/Tag</strong>
              </p>
            </div>
          </Card>
        )}

        {/* Datum Auswahl */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-4">
            <label className="font-medium">Datum:</label>
            <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            <Button variant="secondary" onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])} aria-label="Datum auf heute setzen">
              Heute
            </Button>
          </div>
        </Card>

        {/* Statistiken & Progress */}
        {stats && stats.profile && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Kalorien Progress */}
            <Card className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-sm font-medium text-[rgb(var(--fg-muted))]">Kalorien Heute</h3>
                  <p className="text-3xl font-bold mt-1">
                    {stats.today.total_calories}
                    <span className="text-lg text-[rgb(var(--fg-subtle))]"> / {calculatedCalories}</span>
                  </p>
                  <p className="text-sm text-[rgb(var(--fg-subtle))] mt-1">
                    Ziel: {getGoalLabel(goalType)}
                  </p>
                </div>
                <span className="text-4xl">🔥</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3" aria-hidden="true">
                <div
                  className={`h-3 rounded-full ${getProgressColor(stats.today.total_calories, calculatedCalories)}`}
                  style={{ width: `${calculateProgress(stats.today.total_calories, calculatedCalories)}%` }}
                />
              </div>
              <p className="text-xs text-[rgb(var(--fg-subtle))] mt-2">
                {Math.round(calculateProgress(stats.today.total_calories, calculatedCalories))}% erreicht
              </p>
            </Card>

            {/* Makros */}
            <Card className="p-6">
              <h3 className="text-sm font-medium text-[rgb(var(--fg-muted))] mb-4">Makronährstoffe Heute</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>💪 Protein</span>
                    <span className="font-medium">{stats.today.total_protein}g / {calculatedMacros.protein}g</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${calculateProgress(stats.today.total_protein, calculatedMacros.protein)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>🌾 Kohlenhydrate</span>
                    <span className="font-medium">{stats.today.total_carbs}g / {calculatedMacros.carbs}g</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${calculateProgress(stats.today.total_carbs, calculatedMacros.carbs)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>🥑 Fett</span>
                    <span className="font-medium">{stats.today.total_fat}g / {calculatedMacros.fat}g</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: `${calculateProgress(stats.today.total_fat, calculatedMacros.fat)}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Makro Verteilung Chart */}
            <Card className="p-6">
              <h3 className="text-sm font-medium text-[rgb(var(--fg-muted))] mb-4">Makro-Verteilung</h3>
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
            </Card>
          </div>
        )}

        {/* Mahlzeiten Log */}
        <div className="card overflow-hidden">
          <div className="card-header">
            <h2 className="text-xl font-bold">
              Mahlzeiten - {new Date(selectedDate).toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
            </h2>
          </div>

          {logs.length === 0 ? (
            <div className="p-8 text-center text-[rgb(var(--fg-subtle))]">
              Noch keine Mahlzeiten für dieses Datum eingetragen.
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'rgb(var(--card-border))' }}>
              {logs.map((log) => (
                <div key={log.id} className="p-6 hover:bg-[rgb(var(--bg-elevated))] transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{getMealIcon(log.meal_type)}</span>
                        <div>
                          <h3 className="text-lg font-bold">{log.food_name}</h3>
                          <p className="text-sm text-[rgb(var(--fg-subtle))]">{getMealLabel(log.meal_type)}</p>
                        </div>
                      </div>
                      <div className="flex gap-6 text-sm text-[rgb(var(--fg-muted))] mt-3">
                        <span className="font-medium">🔥 {log.calories} kcal</span>
                        {log.protein && <span>💪 {log.protein}g Protein</span>}
                        {log.carbs && <span>🌾 {log.carbs}g Carbs</span>}
                        {log.fat && <span>🥑 {log.fat}g Fett</span>}
                      </div>
                      {log.notes && (
                        <p className="text-sm text-[rgb(var(--fg-subtle))] mt-2 italic">{log.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => handleEditLog(log)} aria-label="Mahlzeit bearbeiten">Bearbeiten</Button>
                      <Button variant="danger" size="sm" onClick={() => handleDeleteLog(log.id)} aria-label="Mahlzeit löschen">Löschen</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Body Data Popup */}
        {showBodyDataPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="card max-w-md w-full p-6" role="dialog" aria-modal="true" aria-labelledby="body-data-title">
              <h2 id="body-data-title" className="text-2xl font-bold mb-4">📊 Körperdaten benötigt</h2>
              <p className="text-[rgb(var(--fg-muted))] mb-6">
                Um deine Ernährung optimal zu berechnen, benötigen wir dein aktuelles Gewicht und deine Körpergröße.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Gewicht (kg) *</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={tempWeight}
                    onChange={(e) => setTempWeight(e.target.value)}
                    placeholder="z.B. 75.5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Körpergröße (cm) *</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={tempHeight}
                    onChange={(e) => setTempHeight(e.target.value)}
                    placeholder="z.B. 180"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button onClick={handleSaveBodyData} className="flex-1">
                  Weiter
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Profile Modal (mit berechneten Werten) */}
        {showProfileModal && bodyData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="card max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="nutrition-profile-title">
              <h2 id="nutrition-profile-title" className="text-2xl font-bold mb-4">🍽️ Ernährungsprofil</h2>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
                <h3 className="font-semibold mb-2">📊 Deine Berechnungen</h3>
                <div className="text-sm space-y-1 text-[rgb(var(--fg-muted))]">
                  <p><strong>Gewicht:</strong> {bodyData.weight} kg</p>
                  <p><strong>Größe:</strong> {bodyData.height} cm</p>
                  <p><strong>BMR (Grundumsatz):</strong> {calculateBMR(bodyData.weight, bodyData.height)} kcal</p>
                  <p><strong>Erhaltungskalorien:</strong> {calculateMaintenanceCalories(calculateBMR(bodyData.weight, bodyData.height))} kcal</p>
                  <p className="pt-2 font-semibold" style={{ color: 'rgb(var(--accent))' }}>
                    <strong>Dein Ziel ({getGoalLabel(goalType)}):</strong> {calculatedCalories} kcal/Tag
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Ziel *</label>
                  <Select
                    value={goalType}
                    onChange={(e) => setGoalType(e.target.value as typeof goalType)}
                    required
                  >
                    <option value="LOSE_WEIGHT">📉 Abnehmen (-500 kcal Defizit)</option>
                    <option value="MAINTAIN">⚖️ Gewicht halten</option>
                    <option value="GAIN_WEIGHT">📈 Zunehmen (+300 kcal Überschuss)</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Ernährungsform *</label>
                  <Select
                    value={dietType}
                    onChange={(e) => setDietType(e.target.value as typeof dietType)}
                    required
                  >
                    <option value="BALANCED">⚖️ Balanced (30% P / 40% C / 30% F)</option>
                    <option value="HIGH_PROTEIN">💪 High Protein (40% P / 30% C / 30% F)</option>
                    <option value="LOW_CARB">🥑 Low Carb (35% P / 20% C / 45% F)</option>
                    <option value="KETO">🔥 Keto (25% P / 5% C / 70% F)</option>
                    <option value="STANDARD">📊 Standard (30% P / 40% C / 30% F)</option>
                  </Select>
                </div>

                <div className="border-t pt-4" style={{ borderColor: 'rgb(var(--card-border))' }}>
                  <h3 className="text-sm font-semibold mb-3">Automatisch berechnete Makros</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-2xl font-bold">{calculatedMacros.protein}g</p>
                      <p className="text-xs text-[rgb(var(--fg-subtle))]">Protein</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-2xl font-bold">{calculatedMacros.carbs}g</p>
                      <p className="text-xs text-[rgb(var(--fg-subtle))]">Carbs</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <p className="text-2xl font-bold">{calculatedMacros.fat}g</p>
                      <p className="text-xs text-[rgb(var(--fg-subtle))]">Fett</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                {profile && (
                  <Button type="button" variant="secondary" onClick={() => setShowProfileModal(false)}>
                    Abbrechen
                  </Button>
                )}
                <Button onClick={handleSaveProfile}>Profil speichern</Button>
              </div>
            </div>
          </div>
        )}

        {/* Log Modal */}
        {showLogModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="card max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="nutrition-log-title">
              <h2 id="nutrition-log-title" className="text-2xl font-bold mb-4">{editingLogId ? 'Mahlzeit bearbeiten' : 'Mahlzeit hinzufügen'}</h2>
              <form onSubmit={handleSaveLog}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Datum *</label>
                    <Input type="date" value={logForm.date} onChange={(e) => setLogForm({ ...logForm, date: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Mahlzeit *</label>
                    <Select value={logForm.mealType} onChange={(e) => setLogForm({ ...logForm, mealType: e.target.value as any })} required>
                      <option value="BREAKFAST">🌅 Frühstück</option>
                      <option value="LUNCH">🍱 Mittagessen</option>
                      <option value="DINNER">🍽️ Abendessen</option>
                      <option value="SNACK">🍎 Snack</option>
                    </Select>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Lebensmittel *</label>
                  <Input type="text" value={logForm.foodName} onChange={(e) => setLogForm({ ...logForm, foodName: e.target.value })} placeholder="z.B. Haferflocken mit Banane" required />
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Kalorien *</label>
                    <Input type="number" value={logForm.calories} onChange={(e) => setLogForm({ ...logForm, calories: e.target.value })} placeholder="z.B. 350" required min={0} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Protein (g)</label>
                    <Input type="number" step="0.1" value={logForm.protein} onChange={(e) => setLogForm({ ...logForm, protein: e.target.value })} placeholder="z.B. 15" min={0} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Kohlenhydrate (g)</label>
                    <Input type="number" step="0.1" value={logForm.carbs} onChange={(e) => setLogForm({ ...logForm, carbs: e.target.value })} placeholder="z.B. 60" min={0} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Fett (g)</label>
                    <Input type="number" step="0.1" value={logForm.fat} onChange={(e) => setLogForm({ ...logForm, fat: e.target.value })} placeholder="z.B. 8" min={0} />
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-1">Notizen</label>
                  <Textarea value={logForm.notes} onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })} rows={2} placeholder="Optionale Notizen..." />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="secondary"
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
                  >
                    Abbrechen
                  </Button>
                  <Button type="submit">{editingLogId ? 'Aktualisieren' : 'Hinzufügen'}</Button>
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
