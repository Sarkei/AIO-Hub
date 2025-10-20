'use client'

import AppLayout from '@/components/AppLayout'

export default function CalendarPage() {
  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">🗓️ Kalender</h1>
          <p className="text-[rgb(var(--fg-muted))] mt-1">Tages- und Wochenansicht – Coming soon</p>
        </header>
        <div className="card p-8 text-[rgb(var(--fg-subtle))]">
          Hier entsteht eine übersichtliche Kalenderansicht inspiriert von Cron/Notion Calendar.
        </div>
      </div>
    </AppLayout>
  )
}
