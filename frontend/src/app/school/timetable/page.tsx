'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import AppLayout from '@/components/AppLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const DAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
const TIME_SLOTS = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

export default function TimetablePage() {
  const router = useRouter();
  const [timetable, setTimetable] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await axios.get('http://localhost:4000/api/school/timetable', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTimetable(res.data.timetable);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <AppLayout><div className="flex items-center justify-center h-full"><div className="text-lg" style={{ color: 'rgb(var(--fg-muted))' }}>Lädt...</div></div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'rgb(var(--fg))' }}>
            🗓️ Stundenplan
          </h1>
          <p style={{ color: 'rgb(var(--fg-muted))' }}>
            Deine wöchentlichen Schulstunden
          </p>
        </div>

        {timetable.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-lg mb-2" style={{ color: 'rgb(var(--fg))' }}>Noch keine Stunden eingetragen</p>
              <p style={{ color: 'rgb(var(--fg-muted))' }}>Erstelle dein erstes Schuljahr und füge Stunden hinzu</p>
              <Button className="mt-4" onClick={() => router.push('/school/overview')}>Schuljahr erstellen</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {DAYS.map((day, idx) => (
              <div key={day}>
                <div className="font-bold text-center p-2 mb-2 rounded-lg" style={{ backgroundColor: 'rgba(var(--accent), 0.1)', color: 'rgb(var(--accent))' }}>
                  {day}
                </div>
                <div className="space-y-2">
                  {timetable.filter(e => e.day_of_week === idx + 1).map((entry) => (
                    <Card key={entry.id} style={{ borderLeft: `4px solid ${entry.color || 'rgb(var(--accent))'}` }}>
                      <CardContent className="p-3">
                        <div className="font-bold text-sm mb-1" style={{ color: 'rgb(var(--fg))' }}>{entry.subject}</div>
                        <div className="text-xs" style={{ color: 'rgb(var(--fg-muted))' }}>{entry.start_time} - {entry.end_time}</div>
                        {entry.room && <div className="text-xs" style={{ color: 'rgb(var(--fg-muted))' }}>Raum {entry.room}</div>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
