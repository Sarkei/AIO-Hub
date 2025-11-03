'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import AppLayout from '@/components/AppLayout';
import { TacticalStyles, TacticalHelpers } from '@/components/tactical/TacticalStyles';
import {
  TacticalHeader,
  TacticalSection,
  TacticalStatCard,
  TacticalEmptyState,
  TacticalButton,
  TacticalModal,
} from '@/components/tactical/TacticalComponents';

// ==================== TYPES ====================
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
  notes: '',
};

type MetricType = 'weight' | 'body_fat' | 'chest' | 'waist' | 'hips' | 'biceps' | 'thighs' | 'calves';

// ==================== MAIN COMPONENT ====================
export default function BodyMetricsPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<BodyMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [viewMode, setViewMode] = useState<'overview' | 'chart' | 'table'>('overview');
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('weight');

  // ==================== FETCH DATA ====================
  const fetchMetrics = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await axios.get('/api/body-metrics', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMetrics(response.data.metrics || []);
    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
      } else {
        console.error('Error fetching body metrics:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // ==================== HANDLERS ====================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const payload: any = { date: formData.date };
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
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post('/api/body-metrics', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setShowModal(false);
      setEditingId(null);
      setFormData(emptyForm);
      fetchMetrics();
    } catch (error) {
      console.error('Error saving body metric:', error);
      alert('Fehler beim Speichern');
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
      notes: metric.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eintrag löschen?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/body-metrics/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMetrics();
    } catch (error) {
      console.error('Error deleting body metric:', error);
    }
  };

  // ==================== CALCULATIONS ====================
  const getLatestMetric = () => (metrics.length > 0 ? metrics[0] : null);

  const getWeekAgoMetric = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return metrics.find((m) => new Date(m.date) <= weekAgo) || null;
  };

  const calculateChange = (current?: number, previous?: number) => {
    if (!current || !previous) return null;
    const value = current - previous;
    const percentage = (value / previous) * 100;
    return { value, percentage };
  };

  const getChartData = () => {
    return metrics
      .slice()
      .reverse()
      .map((m) => ({
        date: new Date(m.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }),
        value: m[selectedMetric] || 0,
      }));
  };

  const metricLabels: Record<MetricType, string> = {
    weight: 'GEWICHT (KG)',
    body_fat: 'KÖRPERFETT (%)',
    chest: 'BRUST (CM)',
    waist: 'TAILLE (CM)',
    hips: 'HÜFTE (CM)',
    biceps: 'BIZEPS (CM)',
    thighs: 'OBERSCHENKEL (CM)',
    calves: 'WADEN (CM)',
  };

  const latestMetric = getLatestMetric();
  const weekAgoMetric = getWeekAgoMetric();
  const weightChange = calculateChange(latestMetric?.weight, weekAgoMetric?.weight);
  const bodyFatChange = calculateChange(latestMetric?.body_fat, weekAgoMetric?.body_fat);
  const waistChange = calculateChange(latestMetric?.waist, weekAgoMetric?.waist);

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
        <p style={{ color: TacticalStyles.colors.fgMuted }}>LADE KÖRPERDATEN...</p>
      </div>
    );
  }

  // ==================== RENDER ====================
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
            title="KÖRPERMETRIKEN"
            subtitle="TRACKING & FORTSCHRITTSANALYSE"
            actions={
              <div className="flex gap-2">
                <TacticalButton
                  variant="secondary"
                  onClick={() =>
                    setViewMode(
                      viewMode === 'overview' ? 'chart' : viewMode === 'chart' ? 'table' : 'overview'
                    )
                  }
                >
                  {viewMode === 'overview' ? '📈 CHART' : viewMode === 'chart' ? '📋 TABELLE' : '📊 ÜBERSICHT'}
                </TacticalButton>
                <TacticalButton
                  onClick={() => {
                    setEditingId(null);
                    setFormData({ ...emptyForm, date: new Date().toISOString().split('T')[0] });
                    setShowModal(true);
                  }}
                >
                  + MESSUNG
                </TacticalButton>
              </div>
            }
          />

          {/* OVERVIEW MODE */}
          {viewMode === 'overview' && (
            <>
              {metrics.length === 0 ? (
                <TacticalEmptyState
                  icon="📊"
                  title="KEINE MESSUNGEN"
                  description="Starte jetzt mit deinem ersten Body-Tracking! Erfasse Gewicht, Körperfett und Umfänge um deinen Fortschritt zu überwachen."
                  actionLabel="+ ERSTE MESSUNG"
                  onAction={() => {
                    setEditingId(null);
                    setFormData({ ...emptyForm, date: new Date().toISOString().split('T')[0] });
                    setShowModal(true);
                  }}
                />
              ) : (
                <>
                  {/* Stat Cards */}
                  <TacticalSection title="AKTUELLE WERTE" markerColor="accent">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <TacticalStatCard
                        label="GEWICHT"
                        value={latestMetric?.weight?.toFixed(1) || '-'}
                        unit="KG"
                        subtitle={
                          weightChange
                            ? `${weightChange.value > 0 ? '+' : ''}${weightChange.value.toFixed(1)} KG (7 TAGE)`
                            : undefined
                        }
                        borderColor="accent"
                      />
                      <TacticalStatCard
                        label="KÖRPERFETT"
                        value={latestMetric?.body_fat?.toFixed(1) || '-'}
                        unit="%"
                        subtitle={
                          bodyFatChange
                            ? `${bodyFatChange.value > 0 ? '+' : ''}${bodyFatChange.value.toFixed(1)}% (7 TAGE)`
                            : undefined
                        }
                        borderColor="forest"
                      />
                      <TacticalStatCard
                        label="TAILLE"
                        value={latestMetric?.waist?.toFixed(1) || '-'}
                        unit="CM"
                        subtitle={
                          waistChange
                            ? `${waistChange.value > 0 ? '+' : ''}${waistChange.value.toFixed(1)} CM (7 TAGE)`
                            : undefined
                        }
                        borderColor="olive"
                      />
                      <TacticalStatCard
                        label="MESSUNGEN"
                        value={metrics.length}
                        unit="TOTAL"
                        subtitle={`SEIT ${new Date(metrics[metrics.length - 1]?.date || '').toLocaleDateString('de-DE', { month: 'short', year: 'numeric' })}`}
                        borderColor="accent"
                      />
                    </div>
                  </TacticalSection>

                  {/* Body Measurements */}
                  {latestMetric && (
                    <TacticalSection title="KÖRPERUMFÄNGE" markerColor="forest">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <TacticalStatCard
                          label="BRUST"
                          value={latestMetric?.chest?.toFixed(1) || '-'}
                          unit="CM"
                          borderColor="accent"
                        />
                        <TacticalStatCard
                          label="BIZEPS"
                          value={latestMetric?.biceps?.toFixed(1) || '-'}
                          unit="CM"
                          borderColor="forest"
                        />
                        <TacticalStatCard
                          label="OBERSCHENKEL"
                          value={latestMetric?.thighs?.toFixed(1) || '-'}
                          unit="CM"
                          borderColor="olive"
                        />
                        <TacticalStatCard
                          label="WADEN"
                          value={latestMetric?.calves?.toFixed(1) || '-'}
                          unit="CM"
                          borderColor="accent"
                        />
                      </div>
                    </TacticalSection>
                  )}

                  {/* Quick Chart Preview */}
                  <TacticalSection title="GEWICHTSVERLAUF (30 TAGE)" markerColor="olive">
                    <div
                      style={{
                        backgroundColor: TacticalStyles.colors.card,
                        border: TacticalStyles.borders.default,
                        borderRadius: '0.5rem',
                        padding: '1.5rem',
                      }}
                    >
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={getChartData().slice(-30)}>
                          <CartesianGrid strokeDasharray="3 3" stroke={TacticalStyles.colors.border} />
                          <XAxis dataKey="date" stroke={TacticalStyles.colors.fgSubtle} />
                          <YAxis stroke={TacticalStyles.colors.fgSubtle} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: TacticalStyles.colors.card,
                              border: TacticalStyles.borders.default,
                              borderRadius: '0.375rem',
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke={TacticalStyles.colors.accent}
                            strokeWidth={3}
                            dot={{ fill: TacticalStyles.colors.accent, r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </TacticalSection>
                </>
              )}
            </>
          )}

          {/* CHART MODE */}
          {viewMode === 'chart' && metrics.length > 0 && (
            <TacticalSection title="DETAILLIERTE ANALYSE" markerColor="accent">
              <div
                style={{
                  backgroundColor: TacticalStyles.colors.card,
                  border: TacticalStyles.borders.default,
                  borderRadius: '0.5rem',
                  padding: '1.5rem',
                }}
              >
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={TacticalHelpers.getLabelStyles()}>METRIK AUSWÄHLEN</label>
                  <select
                    value={selectedMetric}
                    onChange={(e) => setSelectedMetric(e.target.value as MetricType)}
                    style={{
                      ...TacticalHelpers.getInputStyles(),
                      cursor: 'pointer',
                    }}
                  >
                    <option value="weight">GEWICHT</option>
                    <option value="body_fat">KÖRPERFETT</option>
                    <option value="chest">BRUST</option>
                    <option value="waist">TAILLE</option>
                    <option value="hips">HÜFTE</option>
                    <option value="biceps">BIZEPS</option>
                    <option value="thighs">OBERSCHENKEL</option>
                    <option value="calves">WADEN</option>
                  </select>
                </div>

                <ResponsiveContainer width="100%" height={500}>
                  <LineChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke={TacticalStyles.colors.border} />
                    <XAxis dataKey="date" stroke={TacticalStyles.colors.fgSubtle} />
                    <YAxis stroke={TacticalStyles.colors.fgSubtle} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: TacticalStyles.colors.card,
                        border: TacticalStyles.borders.default,
                        borderRadius: '0.375rem',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name={metricLabels[selectedMetric]}
                      stroke={TacticalStyles.colors.accent}
                      strokeWidth={3}
                      dot={{ fill: TacticalStyles.colors.accent, r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TacticalSection>
          )}

          {/* TABLE MODE */}
          {viewMode === 'table' && (
            <TacticalSection title="ALLE MESSUNGEN" markerColor="forest">
              {metrics.length === 0 ? (
                <TacticalEmptyState
                  icon="📊"
                  title="KEINE MESSUNGEN"
                  description="Erfasse deine erste Körpermessung."
                  actionLabel="+ ERSTE MESSUNG"
                  onAction={() => setShowModal(true)}
                />
              ) : (
                <div
                  style={{
                    backgroundColor: TacticalStyles.colors.card,
                    border: TacticalStyles.borders.default,
                    borderRadius: '0.5rem',
                    overflowX: 'auto',
                  }}
                >
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: TacticalStyles.colors.cardHover }}>
                        <th style={TacticalHelpers.getTableHeader()}>DATUM</th>
                        <th style={TacticalHelpers.getTableHeader()}>GEWICHT</th>
                        <th style={TacticalHelpers.getTableHeader()}>FETT</th>
                        <th style={TacticalHelpers.getTableHeader()}>BRUST</th>
                        <th style={TacticalHelpers.getTableHeader()}>TAILLE</th>
                        <th style={TacticalHelpers.getTableHeader()}>HÜFTE</th>
                        <th style={TacticalHelpers.getTableHeader()}>BIZEPS</th>
                        <th style={TacticalHelpers.getTableHeader()}>AKTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.map((metric) => (
                        <tr
                          key={metric.id}
                          style={{ borderBottom: TacticalStyles.borders.subtle }}
                        >
                          <td style={TacticalHelpers.getTableCell()}>
                            {new Date(metric.date).toLocaleDateString('de-DE')}
                          </td>
                          <td style={TacticalHelpers.getTableCell()}>
                            {metric.weight ? `${metric.weight} KG` : '-'}
                          </td>
                          <td style={TacticalHelpers.getTableCell()}>
                            {metric.body_fat ? `${metric.body_fat}%` : '-'}
                          </td>
                          <td style={TacticalHelpers.getTableCell()}>
                            {metric.chest ? `${metric.chest} CM` : '-'}
                          </td>
                          <td style={TacticalHelpers.getTableCell()}>
                            {metric.waist ? `${metric.waist} CM` : '-'}
                          </td>
                          <td style={TacticalHelpers.getTableCell()}>
                            {metric.hips ? `${metric.hips} CM` : '-'}
                          </td>
                          <td style={TacticalHelpers.getTableCell()}>
                            {metric.biceps ? `${metric.biceps} CM` : '-'}
                          </td>
                          <td style={TacticalHelpers.getTableCell()}>
                            <div className="flex gap-2">
                              <TacticalButton onClick={() => handleEdit(metric)}>EDIT</TacticalButton>
                              <TacticalButton variant="danger" onClick={() => handleDelete(metric.id)}>
                                DEL
                              </TacticalButton>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TacticalSection>
          )}

          {/* Modal */}
          <TacticalModal
            isOpen={showModal}
            onClose={() => {
              setShowModal(false);
              setEditingId(null);
              setFormData(emptyForm);
            }}
            title={editingId ? 'MESSUNG BEARBEITEN' : 'NEUE MESSUNG'}
          >
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={TacticalHelpers.getLabelStyles()}>DATUM *</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    style={{ ...TacticalHelpers.getInputStyles(), flex: 1 }}
                  />
                  <TacticalButton
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      setFormData({ ...formData, date: new Date().toISOString().split('T')[0] })
                    }
                  >
                    HEUTE
                  </TacticalButton>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4" style={{ marginBottom: '1rem' }}>
                <div>
                  <label style={TacticalHelpers.getLabelStyles()}>GEWICHT (KG)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="z.B. 75.5"
                    style={TacticalHelpers.getInputStyles()}
                  />
                </div>
                <div>
                  <label style={TacticalHelpers.getLabelStyles()}>KÖRPERFETT (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.bodyFat}
                    onChange={(e) => setFormData({ ...formData, bodyFat: e.target.value })}
                    placeholder="z.B. 15.5"
                    style={TacticalHelpers.getInputStyles()}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4" style={{ marginBottom: '1rem' }}>
                <div>
                  <label style={TacticalHelpers.getLabelStyles()}>BRUST (CM)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.chest}
                    onChange={(e) => setFormData({ ...formData, chest: e.target.value })}
                    style={TacticalHelpers.getInputStyles()}
                  />
                </div>
                <div>
                  <label style={TacticalHelpers.getLabelStyles()}>TAILLE (CM)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.waist}
                    onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
                    style={TacticalHelpers.getInputStyles()}
                  />
                </div>
                <div>
                  <label style={TacticalHelpers.getLabelStyles()}>HÜFTE (CM)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.hips}
                    onChange={(e) => setFormData({ ...formData, hips: e.target.value })}
                    style={TacticalHelpers.getInputStyles()}
                  />
                </div>
                <div>
                  <label style={TacticalHelpers.getLabelStyles()}>BIZEPS (CM)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.biceps}
                    onChange={(e) => setFormData({ ...formData, biceps: e.target.value })}
                    style={TacticalHelpers.getInputStyles()}
                  />
                </div>
                <div>
                  <label style={TacticalHelpers.getLabelStyles()}>OBERSCHENKEL (CM)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.thighs}
                    onChange={(e) => setFormData({ ...formData, thighs: e.target.value })}
                    style={TacticalHelpers.getInputStyles()}
                  />
                </div>
                <div>
                  <label style={TacticalHelpers.getLabelStyles()}>WADEN (CM)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.calves}
                    onChange={(e) => setFormData({ ...formData, calves: e.target.value })}
                    style={TacticalHelpers.getInputStyles()}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={TacticalHelpers.getLabelStyles()}>NOTIZEN</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                    setShowModal(false);
                    setEditingId(null);
                    setFormData(emptyForm);
                  }}
                >
                  ABBRECHEN
                </TacticalButton>
                <TacticalButton type="submit">{editingId ? 'UPDATE' : 'ERSTELLEN'}</TacticalButton>
              </div>
            </form>
          </TacticalModal>
        </div>
      </div>
    </AppLayout>
  );
}
