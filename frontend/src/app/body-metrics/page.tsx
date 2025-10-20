'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BodyMetric {
  id: string;
  date: string;
  weight?: number;
  body_fat?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  biceps?: number;
  thighs?: number;
  calves?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface FormData {
  date: string;
  weight: string;
  bodyFat: string;
  chest: string;
  waist: string;
  hips: string;
  biceps: string;
  thighs: string;
  calves: string;
  notes: string;
}

const emptyForm: FormData = {
  date: new Date().toISOString().split('T')[0],
  weight: '',
  bodyFat: '',
  chest: '',
  waist: '',
  hips: '',
  biceps: '',
  thighs: '',
  calves: '',
  notes: ''
};

export default function BodyMetricsPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<BodyMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [viewMode, setViewMode] = useState<'list' | 'chart'>('list');
  const [selectedMetric, setSelectedMetric] = useState<'weight' | 'chest' | 'waist' | 'hips' | 'biceps' | 'thighs' | 'calves' | 'bodyFat'>('weight');
  const [showStats, setShowStats] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await axios.get('/api/body-metrics', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMetrics(response.data.metrics || []);
    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
      } else {
        console.error('Error fetching body metrics:', error);
        alert('Fehler beim Laden der Körperdaten');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const payload: any = {
        date: formData.date
      };

      // Nur ausgefüllte Felder hinzufügen
      if (formData.weight) payload.weight = parseFloat(formData.weight);
      if (formData.bodyFat) payload.bodyFat = parseFloat(formData.bodyFat);
      if (formData.chest) payload.chest = parseFloat(formData.chest);
      if (formData.waist) payload.waist = parseFloat(formData.waist);
      if (formData.hips) payload.hips = parseFloat(formData.hips);
      if (formData.biceps) payload.biceps = parseFloat(formData.biceps);
      if (formData.thighs) payload.thighs = parseFloat(formData.thighs);
      if (formData.calves) payload.calves = parseFloat(formData.calves);
      if (formData.notes) payload.notes = formData.notes;

      if (editingId) {
        await axios.put(`/api/body-metrics/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/body-metrics', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setShowModal(false);
      setEditingId(null);
      setFormData(emptyForm);
      fetchMetrics();
    } catch (error: any) {
      console.error('Error saving body metric:', error);
      alert(error.response?.data?.message || 'Fehler beim Speichern');
    }
  };

  const handleEdit = (metric: BodyMetric) => {
    setEditingId(metric.id);
    setFormData({
      date: metric.date,
      weight: metric.weight?.toString() || '',
      bodyFat: metric.body_fat?.toString() || '',
      chest: metric.chest?.toString() || '',
      waist: metric.waist?.toString() || '',
      hips: metric.hips?.toString() || '',
      biceps: metric.biceps?.toString() || '',
      thighs: metric.thighs?.toString() || '',
      calves: metric.calves?.toString() || '',
      notes: metric.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Diesen Eintrag wirklich löschen?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/body-metrics/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMetrics();
    } catch (error) {
      console.error('Error deleting body metric:', error);
      alert('Fehler beim Löschen');
    }
  };

  const setToday = () => {
    setFormData({ ...formData, date: new Date().toISOString().split('T')[0] });
  };

  const getChartData = () => {
    return metrics
      .slice()
      .reverse()
      .map(m => ({
        date: new Date(m.date).toLocaleDateString('de-DE'),
        value: m[selectedMetric === 'bodyFat' ? 'body_fat' : selectedMetric] || 0
      }));
  };

  const metricLabels: Record<typeof selectedMetric, string> = {
    weight: 'Gewicht (kg)',
    bodyFat: 'Körperfett (%)',
    chest: 'Brust (cm)',
    waist: 'Taille (cm)',
    hips: 'Hüfte (cm)',
    biceps: 'Bizeps (cm)',
    thighs: 'Oberschenkel (cm)',
    calves: 'Waden (cm)'
  };

  // Statistiken berechnen
  const getLatestMetric = () => {
    if (metrics.length === 0) return null;
    return metrics[0];
  };

  const getWeekAgoMetric = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    return metrics.find(m => new Date(m.date) <= weekAgo) || null;
  };

  const calculateChange = (current?: number, previous?: number): { value: number; percentage: number } | null => {
    if (!current || !previous) return null;
    const value = current - previous;
    const percentage = ((value / previous) * 100);
    return { value, percentage };
  };

  const getChangeColor = (change: number, isWeight: boolean = false): string => {
    // Bei Gewicht: negativ = grün (Abnahme gut bei Diät)
    // Bei Maßen: negativ = grün (Reduktion gut)
    if (Math.abs(change) < 0.1) return 'text-gray-500';
    return change < 0 ? 'text-green-600' : 'text-red-600';
  };

  const getChangeIcon = (change: number): string => {
    if (Math.abs(change) < 0.1) return '➡️';
    return change < 0 ? '📉' : '📈';
  };

  const latestMetric = getLatestMetric();
  const weekAgoMetric = getWeekAgoMetric();

  const weightChange = latestMetric && weekAgoMetric ? calculateChange(latestMetric.weight, weekAgoMetric.weight) : null;
  const bodyFatChange = latestMetric && weekAgoMetric ? calculateChange(latestMetric.body_fat, weekAgoMetric.body_fat) : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg text-gray-600">Lade Körperdaten...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📊 Body Metrics</h1>
            <p className="text-gray-600 mt-1">Verfolge deine Körperdaten</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'list' ? 'chart' : 'list')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              {viewMode === 'list' ? '📈 Chart' : '📋 Liste'}
            </button>
            <button
              onClick={() => {
                setEditingId(null);
                setFormData({ ...emptyForm, date: new Date().toISOString().split('T')[0] });
                setShowModal(true);
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              + Neuer Eintrag
            </button>
          </div>
        </div>

        {/* Statistiken Cards */}
        {showStats && latestMetric && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Aktuelles Gewicht */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Aktuelles Gewicht</span>
                <span className="text-2xl">⚖️</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {latestMetric.weight ? `${latestMetric.weight} kg` : '-'}
              </div>
              {weightChange && (
                <div className={`text-sm mt-2 ${getChangeColor(weightChange.value, true)}`}>
                  {getChangeIcon(weightChange.value)} {weightChange.value > 0 ? '+' : ''}{weightChange.value.toFixed(1)} kg
                  <span className="text-gray-500"> ({weightChange.percentage > 0 ? '+' : ''}{weightChange.percentage.toFixed(1)}%)</span>
                </div>
              )}
            </div>

            {/* Körperfett */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Körperfett</span>
                <span className="text-2xl">💧</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {latestMetric.body_fat ? `${latestMetric.body_fat}%` : '-'}
              </div>
              {bodyFatChange && (
                <div className={`text-sm mt-2 ${getChangeColor(bodyFatChange.value)}`}>
                  {getChangeIcon(bodyFatChange.value)} {bodyFatChange.value > 0 ? '+' : ''}{bodyFatChange.value.toFixed(1)}%
                </div>
              )}
            </div>

            {/* Taille */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Taille</span>
                <span className="text-2xl">📏</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {latestMetric.waist ? `${latestMetric.waist} cm` : '-'}
              </div>
              {weekAgoMetric?.waist && latestMetric.waist && (
                <div className={`text-sm mt-2 ${getChangeColor(latestMetric.waist - weekAgoMetric.waist)}`}>
                  {getChangeIcon(latestMetric.waist - weekAgoMetric.waist)} {(latestMetric.waist - weekAgoMetric.waist) > 0 ? '+' : ''}{(latestMetric.waist - weekAgoMetric.waist).toFixed(1)} cm
                </div>
              )}
            </div>

            {/* Letzte Messung */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Letzte Messung</span>
                <span className="text-2xl">📅</span>
              </div>
              <div className="text-xl font-bold text-gray-900">
                {new Date(latestMetric.date).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                {metrics.length} Einträge gesamt
              </div>
            </div>
          </div>
        )}

        {/* Chart View */}
        {viewMode === 'chart' && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auswählen:
              </label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="weight">Gewicht</option>
                <option value="bodyFat">Körperfett</option>
                <option value="chest">Brust</option>
                <option value="waist">Taille</option>
                <option value="hips">Hüfte</option>
                <option value="biceps">Bizeps</option>
                <option value="thighs">Oberschenkel</option>
                <option value="calves">Waden</option>
              </select>
            </div>

            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  name={metricLabels[selectedMetric]}
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {metrics.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Noch keine Einträge. Erstelle deinen ersten Eintrag!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Datum</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gewicht</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Körperfett</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brust</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Taille</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hüfte</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bizeps</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Oberschenkel</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waden</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {metrics.map((metric) => (
                      <tr key={metric.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {new Date(metric.date).toLocaleDateString('de-DE')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {metric.weight ? `${metric.weight} kg` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {metric.body_fat ? `${metric.body_fat}%` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {metric.chest ? `${metric.chest} cm` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {metric.waist ? `${metric.waist} cm` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {metric.hips ? `${metric.hips} cm` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {metric.biceps ? `${metric.biceps} cm` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {metric.thighs ? `${metric.thighs} cm` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {metric.calves ? `${metric.calves} cm` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEdit(metric)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Bearbeiten
                          </button>
                          <button
                            onClick={() => handleDelete(metric.id)}
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
            )}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">
                {editingId ? 'Eintrag bearbeiten' : 'Neuer Eintrag'}
              </h2>

              <form onSubmit={handleSubmit}>
                {/* Datum */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Datum *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                    <button
                      type="button"
                      onClick={setToday}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Heute
                    </button>
                  </div>
                </div>

                {/* Gewicht & Körperfett */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gewicht (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="z.B. 75.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Körperfett (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.bodyFat}
                      onChange={(e) => setFormData({ ...formData, bodyFat: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="z.B. 15.5"
                    />
                  </div>
                </div>

                {/* Körpermaße */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brust (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.chest}
                      onChange={(e) => setFormData({ ...formData, chest: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="z.B. 100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Taille (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.waist}
                      onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="z.B. 80"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hüfte (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.hips}
                      onChange={(e) => setFormData({ ...formData, hips: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="z.B. 95"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bizeps (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.biceps}
                      onChange={(e) => setFormData({ ...formData, biceps: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="z.B. 35"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Oberschenkel (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.thighs}
                      onChange={(e) => setFormData({ ...formData, thighs: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="z.B. 60"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Waden (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.calves}
                      onChange={(e) => setFormData({ ...formData, calves: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="z.B. 40"
                    />
                  </div>
                </div>

                {/* Notizen */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notizen
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                    placeholder="Optionale Notizen..."
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingId(null);
                      setFormData(emptyForm);
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingId ? 'Aktualisieren' : 'Erstellen'}
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
