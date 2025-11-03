'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import AppLayout from '@/components/AppLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface DashboardStats {
  fitness: {
    currentWeight?: number;
    targetWeight?: number;
    bodyFat?: number;
    weeklyWorkouts: number;
    totalSets: number;
    avgCalories: number;
  };
  productivity: {
    openTodos: number;
    completedToday: number;
    upcomingEvents: number;
  };
  school: {
    averageGrade: number;
    pendingTasks: number;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    fitness: { weeklyWorkouts: 0, totalSets: 0, avgCalories: 0 },
    productivity: { openTodos: 0, completedToday: 0, upcomingEvents: 0 },
    school: { averageGrade: 0, pendingTasks: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Fetch all dashboard data in parallel
      const [bodyMetricsRes, workoutsRes, nutritionRes, todosRes, eventsRes, schoolRes] = await Promise.all([
        axios.get('http://localhost:4000/api/bodymetrics?limit=1', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: { metrics: [] } })),
        axios.get('http://localhost:4000/api/workouts?limit=7', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: { workouts: [] } })),
        axios.get('http://localhost:4000/api/nutrition/logs?days=7', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: { logs: [] } })),
        axios.get('http://localhost:4000/api/todos?status=OPEN', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: { todos: [] } })),
        axios.get('http://localhost:4000/api/events?upcoming=true', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: { events: [] } })),
        axios.get('http://localhost:4000/api/school/todos', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: { todos: [] } }))
      ]);

      const latestMetric = bodyMetricsRes.data.metrics?.[0];
      const workouts = workoutsRes.data.workouts || [];
      const nutritionLogs = nutritionRes.data.logs || [];
      const todos = todosRes.data.todos || [];
      const events = eventsRes.data.events || [];
      const schoolTodos = schoolRes.data.todos || [];

      // Calculate total sets from workouts
      const totalSets = workouts.reduce((acc: number, workout: any) => {
        return acc + (workout.exercises?.reduce((sum: number, ex: any) => sum + (ex.sets?.length || 0), 0) || 0);
      }, 0);

      // Calculate average calories
      const avgCalories = nutritionLogs.length > 0
        ? Math.round(nutritionLogs.reduce((sum: number, log: any) => sum + log.calories, 0) / nutritionLogs.length)
        : 0;

      setStats({
        fitness: {
          currentWeight: latestMetric?.weight,
          bodyFat: latestMetric?.body_fat,
          weeklyWorkouts: workouts.length,
          totalSets,
          avgCalories
        },
        productivity: {
          openTodos: todos.length,
          completedToday: todos.filter((t: any) => {
            const today = new Date().toDateString();
            return t.status === 'DONE' && new Date(t.updated_at).toDateString() === today;
          }).length,
          upcomingEvents: events.length
        },
        school: {
          averageGrade: 0,
          pendingTasks: schoolTodos.length
        }
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-lg" style={{ color: 'rgb(var(--fg-muted))' }}>
            Lädt Dashboard...
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-8 max-w-[1600px] mx-auto">
        {/* Hero Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 
                className="text-5xl font-black mb-2 tracking-tight" 
                style={{ 
                  color: 'rgb(var(--fg))',
                  textShadow: '0 0 40px rgba(132, 204, 22, 0.2)'
                }}
              >
                TACTICAL HUB
              </h1>
              <p className="text-sm font-mono uppercase tracking-wider" style={{ color: 'rgb(var(--accent))' }}>
                System Status: Operational
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black mb-1" style={{ color: 'rgb(var(--accent))' }}>
                {new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
              </div>
              <div className="text-sm font-mono" style={{ color: 'rgb(var(--fg-muted))' }}>
                {new Date().toLocaleDateString('de-DE', { weekday: 'long' }).toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* FITNESS COMMAND CENTER */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-black uppercase tracking-tight" style={{ color: 'rgb(var(--fg))' }}>
              <span style={{ color: 'rgb(var(--accent))' }}>█</span> FITNESS METRICS
            </h2>
            <Button 
              onClick={() => router.push('/gym')}
              style={{
                backgroundColor: 'rgb(var(--accent))',
                color: 'rgb(var(--accent-fg))',
                fontWeight: '700',
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                letterSpacing: '0.05em'
              }}
            >
              → START WORKOUT
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Weight */}
            <Card 
              className="relative overflow-hidden"
              style={{
                backgroundColor: 'rgb(var(--card))',
                border: '1px solid rgb(var(--card-border))',
                borderLeft: '4px solid rgb(var(--accent))'
              }}
            >
              <CardContent className="p-6">
                <div className="text-xs font-mono uppercase mb-2" style={{ color: 'rgb(var(--fg-subtle))' }}>
                  Current Weight
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black" style={{ color: 'rgb(var(--fg))' }}>
                    {stats.fitness.currentWeight || '--'}
                  </span>
                  <span className="text-lg font-bold" style={{ color: 'rgb(var(--fg-muted))' }}>kg</span>
                </div>
                {stats.fitness.bodyFat && (
                  <div className="mt-2 text-sm" style={{ color: 'rgb(var(--accent))' }}>
                    {stats.fitness.bodyFat}% BF
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Weekly Workouts */}
            <Card 
              className="relative overflow-hidden"
              style={{
                backgroundColor: 'rgb(var(--card))',
                border: '1px solid rgb(var(--card-border))',
                borderLeft: '4px solid rgb(var(--forest))'
              }}
            >
              <CardContent className="p-6">
                <div className="text-xs font-mono uppercase mb-2" style={{ color: 'rgb(var(--fg-subtle))' }}>
                  Workouts (7d)
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black" style={{ color: 'rgb(var(--fg))' }}>
                    {stats.fitness.weeklyWorkouts}
                  </span>
                  <span className="text-lg font-bold" style={{ color: 'rgb(var(--fg-muted))' }}>sessions</span>
                </div>
                <div className="mt-2">
                  <div 
                    className="h-1 rounded-full" 
                    style={{ backgroundColor: 'rgb(var(--card-border))' }}
                  >
                    <div 
                      className="h-full rounded-full" 
                      style={{ 
                        backgroundColor: 'rgb(var(--forest))',
                        width: `${Math.min((stats.fitness.weeklyWorkouts / 5) * 100, 100)}%`,
                        boxShadow: 'var(--glow-success)'
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Sets */}
            <Card 
              className="relative overflow-hidden"
              style={{
                backgroundColor: 'rgb(var(--card))',
                border: '1px solid rgb(var(--card-border))',
                borderLeft: '4px solid rgb(var(--olive))'
              }}
            >
              <CardContent className="p-6">
                <div className="text-xs font-mono uppercase mb-2" style={{ color: 'rgb(var(--fg-subtle))' }}>
                  Total Sets (7d)
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black" style={{ color: 'rgb(var(--fg))' }}>
                    {stats.fitness.totalSets}
                  </span>
                  <span className="text-lg font-bold" style={{ color: 'rgb(var(--fg-muted))' }}>sets</span>
                </div>
                <div className="mt-2 text-sm" style={{ color: 'rgb(var(--fg-subtle))' }}>
                  ↑ Volume tracking
                </div>
              </CardContent>
            </Card>

            {/* Average Calories */}
            <Card 
              className="relative overflow-hidden"
              style={{
                backgroundColor: 'rgb(var(--card))',
                border: '1px solid rgb(var(--card-border))',
                borderLeft: '4px solid rgb(var(--warning))'
              }}
            >
              <CardContent className="p-6">
                <div className="text-xs font-mono uppercase mb-2" style={{ color: 'rgb(var(--fg-subtle))' }}>
                  Avg Calories (7d)
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black" style={{ color: 'rgb(var(--fg))' }}>
                    {stats.fitness.avgCalories}
                  </span>
                  <span className="text-lg font-bold" style={{ color: 'rgb(var(--fg-muted))' }}>kcal</span>
                </div>
                <div className="mt-2 text-sm" style={{ color: 'rgb(var(--fg-subtle))' }}>
                  Daily average
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions - Fitness */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card 
              className="cursor-pointer transition-all hover:scale-[1.02]"
              onClick={() => router.push('/gym')}
              style={{
                backgroundColor: 'rgb(var(--card))',
                border: '1px solid rgb(var(--card-border))'
              }}
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                  style={{ backgroundColor: 'rgba(var(--accent), 0.15)' }}
                >
                  🏋️
                </div>
                <div>
                  <div className="font-bold mb-1" style={{ color: 'rgb(var(--fg))' }}>
                    Log Workout
                  </div>
                  <div className="text-xs" style={{ color: 'rgb(var(--fg-subtle))' }}>
                    Track your session
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer transition-all hover:scale-[1.02]"
              onClick={() => router.push('/body-metrics')}
              style={{
                backgroundColor: 'rgb(var(--card))',
                border: '1px solid rgb(var(--card-border))'
              }}
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                  style={{ backgroundColor: 'rgba(var(--forest), 0.15)' }}
                >
                  📊
                </div>
                <div>
                  <div className="font-bold mb-1" style={{ color: 'rgb(var(--fg))' }}>
                    Body Metrics
                  </div>
                  <div className="text-xs" style={{ color: 'rgb(var(--fg-subtle))' }}>
                    Update measurements
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer transition-all hover:scale-[1.02]"
              onClick={() => router.push('/nutrition')}
              style={{
                backgroundColor: 'rgb(var(--card))',
                border: '1px solid rgb(var(--card-border))'
              }}
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                  style={{ backgroundColor: 'rgba(var(--warning), 0.15)' }}
                >
                  🍎
                </div>
                <div>
                  <div className="font-bold mb-1" style={{ color: 'rgb(var(--fg))' }}>
                    Nutrition
                  </div>
                  <div className="text-xs" style={{ color: 'rgb(var(--fg-subtle))' }}>
                    Log meals & macros
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* PRODUCTIVITY & SCHOOL */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Productivity Section */}
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight mb-4" style={{ color: 'rgb(var(--fg))' }}>
              <span style={{ color: 'rgb(var(--info))' }}>█</span> PRODUCTIVITY
            </h2>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <Card style={{ backgroundColor: 'rgb(var(--card))', border: '1px solid rgb(var(--card-border))' }}>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-black mb-1" style={{ color: 'rgb(var(--danger))' }}>
                    {stats.productivity.openTodos}
                  </div>
                  <div className="text-xs font-mono" style={{ color: 'rgb(var(--fg-subtle))' }}>
                    OPEN
                  </div>
                </CardContent>
              </Card>
              <Card style={{ backgroundColor: 'rgb(var(--card))', border: '1px solid rgb(var(--card-border))' }}>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-black mb-1" style={{ color: 'rgb(var(--success))' }}>
                    {stats.productivity.completedToday}
                  </div>
                  <div className="text-xs font-mono" style={{ color: 'rgb(var(--fg-subtle))' }}>
                    TODAY
                  </div>
                </CardContent>
              </Card>
              <Card style={{ backgroundColor: 'rgb(var(--card))', border: '1px solid rgb(var(--card-border))' }}>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-black mb-1" style={{ color: 'rgb(var(--warning))' }}>
                    {stats.productivity.upcomingEvents}
                  </div>
                  <div className="text-xs font-mono" style={{ color: 'rgb(var(--fg-subtle))' }}>
                    EVENTS
                  </div>
                </CardContent>
              </Card>
            </div>
            <Button 
              onClick={() => router.push('/todos')}
              className="w-full"
              style={{
                backgroundColor: 'rgba(var(--info), 0.1)',
                color: 'rgb(var(--info))',
                border: '1px solid rgba(var(--info), 0.3)'
              }}
            >
              → Manage Tasks
            </Button>
          </div>

          {/* School Section */}
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight mb-4" style={{ color: 'rgb(var(--fg))' }}>
              <span style={{ color: 'rgb(var(--warning))' }}>█</span> SCHOOL
            </h2>
            <Card 
              style={{ 
                backgroundColor: 'rgb(var(--card))', 
                border: '1px solid rgb(var(--card-border))',
                height: '140px'
              }}
            >
              <CardContent className="p-6">
                <div className="text-sm font-mono mb-2" style={{ color: 'rgb(var(--fg-subtle))' }}>
                  Pending Tasks
                </div>
                <div className="text-4xl font-black mb-4" style={{ color: 'rgb(var(--warning))' }}>
                  {stats.school.pendingTasks}
                </div>
                <Button 
                  onClick={() => router.push('/school/overview')}
                  size="sm"
                  style={{
                    backgroundColor: 'rgba(var(--warning), 0.1)',
                    color: 'rgb(var(--warning))',
                    border: '1px solid rgba(var(--warning), 0.3)',
                    fontSize: '0.75rem'
                  }}
                >
                  → School Hub
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
