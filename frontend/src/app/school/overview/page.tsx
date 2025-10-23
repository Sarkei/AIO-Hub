'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import AppLayout from '@/components/AppLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Label from '@/components/ui/Label';

interface SchoolYear {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export default function SchoolOverviewPage() {
  const router = useRouter();
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [activeYear, setActiveYear] = useState<SchoolYear | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    isActive: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const [yearsRes, activeRes] = await Promise.all([
        axios.get('http://localhost:4000/api/school/years', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:4000/api/school/years/active', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: { schoolYear: null } }))
      ]);

      setSchoolYears(yearsRes.data.schoolYears);
      setActiveYear(activeRes.data.schoolYear);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:4000/api/school/years',
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowCreateModal(false);
      setForm({ name: '', startDate: '', endDate: '', isActive: true });
      fetchData();
    } catch (error) {
      console.error('Error creating school year:', error);
      alert('Fehler beim Erstellen des Schuljahres');
    }
  };

  const handleActivate = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:4000/api/school/years/${id}/activate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
    } catch (error) {
      console.error('Error activating school year:', error);
      alert('Fehler beim Aktivieren');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-lg" style={{ color: 'rgb(var(--fg-muted))' }}>
            Lädt...
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'rgb(var(--fg))' }}>
            🎓 Schule
          </h1>
          <p style={{ color: 'rgb(var(--fg-muted))' }}>
            Verwalte deine Schuljahre, Stundenplan, Aufgaben und Noten
          </p>
        </div>

        {/* Active School Year Card */}
        {activeYear && (
          <Card className="mb-6" style={{ 
            background: 'linear-gradient(135deg, rgba(var(--accent), 0.1) 0%, rgba(var(--accent), 0.05) 100%)',
            border: '2px solid rgba(var(--accent), 0.3)'
          }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium mb-1" style={{ color: 'rgb(var(--accent))' }}>
                    AKTIVES SCHULJAHR
                  </div>
                  <h2 className="text-2xl font-bold mb-2" style={{ color: 'rgb(var(--fg))' }}>
                    {activeYear.name}
                  </h2>
                  <p style={{ color: 'rgb(var(--fg-muted))' }}>
                    {new Date(activeYear.start_date).toLocaleDateString('de-DE')} - {new Date(activeYear.end_date).toLocaleDateString('de-DE')}
                  </p>
                </div>
                <div className="text-6xl">📚</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card 
            className="cursor-pointer transition-all hover:scale-105"
            onClick={() => router.push('/school/timetable')}
            style={{ 
              backgroundColor: 'rgb(var(--bg-elevated))',
              border: '1px solid rgb(var(--card-border))'
            }}
          >
            <CardContent className="p-6">
              <div className="text-4xl mb-3">🗓️</div>
              <h3 className="font-bold mb-1" style={{ color: 'rgb(var(--fg))' }}>
                Stundenplan
              </h3>
              <p className="text-sm" style={{ color: 'rgb(var(--fg-muted))' }}>
                Deine Schulstunden
              </p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all hover:scale-105"
            onClick={() => router.push('/school/todos')}
            style={{ 
              backgroundColor: 'rgb(var(--bg-elevated))',
              border: '1px solid rgb(var(--card-border))'
            }}
          >
            <CardContent className="p-6">
              <div className="text-4xl mb-3">✅</div>
              <h3 className="font-bold mb-1" style={{ color: 'rgb(var(--fg))' }}>
                Aufgaben
              </h3>
              <p className="text-sm" style={{ color: 'rgb(var(--fg-muted))' }}>
                Hausaufgaben & Projekte
              </p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all hover:scale-105"
            onClick={() => router.push('/school/notes')}
            style={{ 
              backgroundColor: 'rgb(var(--bg-elevated))',
              border: '1px solid rgb(var(--card-border))'
            }}
          >
            <CardContent className="p-6">
              <div className="text-4xl mb-3">📝</div>
              <h3 className="font-bold mb-1" style={{ color: 'rgb(var(--fg))' }}>
                Notizen
              </h3>
              <p className="text-sm" style={{ color: 'rgb(var(--fg-muted))' }}>
                Lernmaterialien & Mitschriften
              </p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all hover:scale-105"
            onClick={() => router.push('/school/grades')}
            style={{ 
              backgroundColor: 'rgb(var(--bg-elevated))',
              border: '1px solid rgb(var(--card-border))'
            }}
          >
            <CardContent className="p-6">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="font-bold mb-1" style={{ color: 'rgb(var(--fg))' }}>
                Noten
              </h3>
              <p className="text-sm" style={{ color: 'rgb(var(--fg-muted))' }}>
                Prüfungen & Durchschnitt
              </p>
            </CardContent>
          </Card>
        </div>

        {/* School Years Management */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h3 className="text-xl font-bold" style={{ color: 'rgb(var(--fg))' }}>
              Schuljahre verwalten
            </h3>
            <Button onClick={() => setShowCreateModal(true)}>
              + Neues Schuljahr
            </Button>
          </CardHeader>
          <CardContent>
            {schoolYears.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎓</div>
                <p className="text-lg mb-2" style={{ color: 'rgb(var(--fg))' }}>
                  Noch keine Schuljahre
                </p>
                <p style={{ color: 'rgb(var(--fg-muted))' }}>
                  Erstelle dein erstes Schuljahr, um loszulegen
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {schoolYears.map((year) => (
                  <div
                    key={year.id}
                    className="flex items-center justify-between p-4 rounded-lg"
                    style={{
                      backgroundColor: year.is_active ? 'rgba(var(--accent), 0.1)' : 'rgb(var(--bg-base))',
                      border: `1px solid ${year.is_active ? 'rgba(var(--accent), 0.3)' : 'rgb(var(--card-border))'}`
                    }}
                  >
                    <div>
                      <div className="font-bold mb-1" style={{ color: 'rgb(var(--fg))' }}>
                        {year.name}
                        {year.is_active && (
                          <span className="ml-2 text-xs px-2 py-1 rounded" style={{
                            backgroundColor: 'rgb(var(--accent))',
                            color: 'white'
                          }}>
                            AKTIV
                          </span>
                        )}
                      </div>
                      <div className="text-sm" style={{ color: 'rgb(var(--fg-muted))' }}>
                        {new Date(year.start_date).toLocaleDateString('de-DE')} - {new Date(year.end_date).toLocaleDateString('de-DE')}
                      </div>
                    </div>
                    {!year.is_active && (
                      <Button
                        onClick={() => handleActivate(year.id)}
                        variant="outline"
                        size="sm"
                      >
                        Aktivieren
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Modal */}
        {showCreateModal && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            onClick={() => setShowCreateModal(false)}
          >
            <Card
              className="w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader>
                <h3 className="text-xl font-bold" style={{ color: 'rgb(var(--fg))' }}>
                  Neues Schuljahr erstellen
                </h3>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <Label>Name *</Label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="z.B. 1. Lehrjahr 2024/2025"
                      required
                    />
                  </div>
                  <div>
                    <Label>Startdatum *</Label>
                    <Input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Enddatum *</Label>
                    <Input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    />
                    <label htmlFor="isActive" style={{ color: 'rgb(var(--fg))' }}>
                      Als aktives Schuljahr setzen
                    </label>
                  </div>
                  <div className="flex gap-3">
                    <Button type="submit" className="flex-1">
                      Erstellen
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateModal(false)}
                    >
                      Abbrechen
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
