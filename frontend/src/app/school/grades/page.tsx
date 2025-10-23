'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import AppLayout from '@/components/AppLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function GradesPage() {
  const router = useRouter();
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await axios.get('http://localhost:4000/api/school/grades', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setGrades(res.data.grades);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  // Gruppiere Noten nach Fach
  const gradesBySubject = grades.reduce((acc, grade) => {
    if (!acc[grade.subject]) {
      acc[grade.subject] = [];
    }
    acc[grade.subject].push(grade);
    return acc;
  }, {} as Record<string, any[]>);

  // Berechne Durchschnitt pro Fach
  const calculateAverage = (subjectGrades: any[]) => {
    if (subjectGrades.length === 0) return 0;
    const totalWeight = subjectGrades.reduce((sum, g) => sum + g.weight, 0);
    const weightedSum = subjectGrades.reduce((sum, g) => sum + (g.grade * g.weight), 0);
    return (weightedSum / totalWeight).toFixed(2);
  };

  if (loading) {
    return <AppLayout><div className="flex items-center justify-center h-full"><div className="text-lg" style={{ color: 'rgb(var(--fg-muted))' }}>Lädt...</div></div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'rgb(var(--fg))' }}>
            📊 Noten
          </h1>
          <p style={{ color: 'rgb(var(--fg-muted))' }}>
            Prüfungen, Tests und Notendurchschnitt
          </p>
        </div>

        {grades.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <div className="text-6xl mb-4">📈</div>
              <p className="text-lg mb-2" style={{ color: 'rgb(var(--fg))' }}>Noch keine Noten eingetragen</p>
              <p style={{ color: 'rgb(var(--fg-muted))' }}>Füge deine Prüfungsergebnisse hinzu, um deinen Fortschritt zu verfolgen</p>
              <Button className="mt-4" onClick={() => router.push('/school/overview')}>Schuljahr erstellen</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(gradesBySubject).map(([subject, subjectGrades]) => (
              <Card key={subject}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <h3 className="text-xl font-bold" style={{ color: 'rgb(var(--fg))' }}>
                    {subject}
                  </h3>
                  <div className="text-2xl font-bold" style={{ color: 'rgb(var(--accent))' }}>
                    ⌀ {calculateAverage(subjectGrades)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {subjectGrades.map((grade) => (
                      <div
                        key={grade.id}
                        className="p-4 rounded-lg"
                        style={{
                          backgroundColor: 'rgb(var(--bg-base))',
                          border: '1px solid rgb(var(--card-border))'
                        }}
                      >
                        <div className="text-sm mb-1" style={{ color: 'rgb(var(--fg-muted))' }}>
                          {new Date(grade.date).toLocaleDateString('de-DE')}
                        </div>
                        <div className="font-bold mb-1" style={{ color: 'rgb(var(--fg))' }}>
                          {grade.title}
                        </div>
                        <div className="text-3xl font-bold" style={{ 
                          color: parseFloat(grade.grade) <= 2.0 ? 'rgb(var(--success))' : 
                                 parseFloat(grade.grade) <= 3.5 ? 'rgb(var(--warning))' : 'rgb(var(--danger))'
                        }}>
                          {grade.grade}
                        </div>
                        {grade.notes && (
                          <div className="text-xs mt-2" style={{ color: 'rgb(var(--fg-muted))' }}>
                            {grade.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
