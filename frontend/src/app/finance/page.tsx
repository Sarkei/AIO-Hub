'use client'

import AppLayout from '@/components/AppLayout'

export default function FinancePage() {
  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">💰 Finanzen</h1>
          <p className="text-[rgb(var(--fg-muted))] mt-1">Konten, Transaktionen und Auswertungen – Coming soon</p>
        </header>
        <div className="card p-8 text-[rgb(var(--fg-subtle))]">
          Inspiriert von Revolut/N26: Kartenlayout, Diagramme und saubere Listen.
        </div>
      </div>
    </AppLayout>
  )
}
