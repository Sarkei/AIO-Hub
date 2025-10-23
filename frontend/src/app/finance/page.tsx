/**
 * ════════════════════════════════════════════════════════════════════════════
 * 💰 Finance Page - Dashboard (Revolut/N26 Inspired)
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * Features:
 * - Total Balance Card with gradient
 * - Account cards grid (Checking, Savings, Credit)
 * - Transaction timeline with category icons
 * - Budget tracking with progress bars
 * - Spending categories pie chart
 * - Monthly comparison stats
 */

'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import Button from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface Account {
  id: string
  name: string
  type: 'checking' | 'savings' | 'credit'
  balance: number
  currency: string
  icon: string
  color: string
}

interface Transaction {
  id: string
  account_id: string
  merchant: string
  category: string
  amount: number
  date: string
  status: 'completed' | 'pending'
  notes?: string
}

interface Budget {
  id: string
  category: string
  icon: string
  budgeted: number
  spent: number
  color: string
}

// Demo Data (später durch API ersetzen)
const DEMO_ACCOUNTS: Account[] = [
  {
    id: '1',
    name: 'Girokonto',
    type: 'checking',
    balance: 2340.50,
    currency: '€',
    icon: '🏦',
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: '2',
    name: 'Sparkonto',
    type: 'savings',
    balance: 5200.00,
    currency: '€',
    icon: '🐷',
    color: 'from-green-500 to-green-600'
  },
  {
    id: '3',
    name: 'Kreditkarte',
    type: 'credit',
    balance: -432.80,
    currency: '€',
    icon: '💳',
    color: 'from-purple-500 to-purple-600'
  }
]

const DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    account_id: '1',
    merchant: 'Rewe Supermarkt',
    category: 'Einkäufe',
    amount: -45.20,
    date: new Date().toISOString(),
    status: 'completed'
  },
  {
    id: '2',
    account_id: '1',
    merchant: 'Gehalt',
    category: 'Einkommen',
    amount: 3200.00,
    date: new Date(Date.now() - 86400000).toISOString(),
    status: 'completed'
  },
  {
    id: '3',
    account_id: '3',
    merchant: 'Netflix',
    category: 'Unterhaltung',
    amount: -15.99,
    date: new Date(Date.now() - 172800000).toISOString(),
    status: 'completed'
  },
  {
    id: '4',
    account_id: '1',
    merchant: 'Shell Tankstelle',
    category: 'Transport',
    amount: -68.50,
    date: new Date(Date.now() - 259200000).toISOString(),
    status: 'completed'
  },
  {
    id: '5',
    account_id: '1',
    merchant: 'Amazon',
    category: 'Einkäufe',
    amount: -127.99,
    date: new Date(Date.now() - 345600000).toISOString(),
    status: 'pending'
  }
]

const DEMO_BUDGETS: Budget[] = [
  { id: '1', category: 'Essen & Trinken', icon: '🍔', budgeted: 400, spent: 287.50, color: 'bg-orange-500' },
  { id: '2', category: 'Transport', icon: '🚗', budgeted: 150, spent: 68.50, color: 'bg-blue-500' },
  { id: '3', category: 'Unterhaltung', icon: '🎮', budgeted: 100, spent: 15.99, color: 'bg-purple-500' },
  { id: '4', category: 'Einkäufe', icon: '🛒', budgeted: 300, spent: 173.19, color: 'bg-green-500' },
  { id: '5', category: 'Wohnen', icon: '🏠', budgeted: 800, spent: 750.00, color: 'bg-red-500' }
]

const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    'Einkäufe': '🛒',
    'Einkommen': '💰',
    'Unterhaltung': '🎮',
    'Transport': '🚗',
    'Essen & Trinken': '🍔',
    'Wohnen': '🏠',
    'Gesundheit': '🏥'
  }
  return icons[category] || '💵'
}

export default function FinancePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [accounts] = useState<Account[]>(DEMO_ACCOUNTS)
  const [transactions] = useState<Transaction[]>(DEMO_TRANSACTIONS)
  const [budgets] = useState<Budget[]>(DEMO_BUDGETS)
  const [view, setView] = useState<'overview' | 'transactions' | 'budgets'>('overview')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)
  const totalBudgeted = budgets.reduce((sum, b) => sum + b.budgeted, 0)
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)

  const getProgressColor = (spent: number, budgeted: number): string => {
    const percentage = (spent / budgeted) * 100
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Heute'
    if (diffDays === 1) return 'Gestern'
    if (diffDays < 7) return `Vor ${diffDays} Tagen`
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: 'rgb(var(--accent))' }} />
      </div>
    )
  }

  return (
    <AppLayout>
      <div className="py-8 px-4" style={{ backgroundColor: 'rgb(var(--bg))' }}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">💰 Finanzen</h1>
            <div className="flex gap-2">
              <Button variant="secondary">+ Transaktion</Button>
              <Button>+ Konto</Button>
            </div>
          </div>

          {/* View Tabs */}
          <div className="flex gap-2 mb-6 bg-[rgb(var(--bg-elevated))] p-1 rounded-lg w-fit" style={{ border: '1px solid rgb(var(--card-border))' }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView('overview')}
              className={view === 'overview' ? 'bg-white dark:bg-gray-700' : ''}
            >
              Übersicht
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView('transactions')}
              className={view === 'transactions' ? 'bg-white dark:bg-gray-700' : ''}
            >
              Transaktionen
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView('budgets')}
              className={view === 'budgets' ? 'bg-white dark:bg-gray-700' : ''}
            >
              Budgets
            </Button>
          </div>

          {/* Total Balance Card (Revolut-Style) */}
          <div 
            className="rounded-xl p-8 mb-8 text-white shadow-xl"
            style={{
              background: 'linear-gradient(135deg, rgb(var(--accent)) 0%, rgba(var(--accent), 0.7) 100%)',
              boxShadow: '0 10px 30px rgba(var(--accent), 0.3)'
            }}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm opacity-90 mb-2">Gesamtguthaben</p>
                <h2 className="text-5xl font-bold mb-3">{formatCurrency(totalBalance)}</h2>
                <p className="text-sm opacity-80">
                  {totalBalance >= 0 ? '↗' : '↘'} {Math.abs(totalBalance - 6800).toFixed(2)} € diesen Monat
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl mb-2">💎</div>
                <p className="text-xs opacity-80">Premium</p>
              </div>
            </div>
          </div>

          {view === 'overview' && (
            <>
              {/* Accounts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {accounts.map(account => (
                  <Card 
                    key={account.id}
                    className="p-6 hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div 
                        className={`w-12 h-12 rounded-full bg-gradient-to-br ${account.color} flex items-center justify-center text-2xl shadow-lg`}
                      >
                        {account.icon}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        account.type === 'savings' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        account.type === 'credit' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {account.type === 'savings' ? 'Sparkonto' : account.type === 'credit' ? 'Kredit' : 'Giro'}
                      </span>
                    </div>
                    <h3 className="text-sm text-[rgb(var(--fg-muted))] mb-1">{account.name}</h3>
                    <p className={`text-3xl font-bold ${account.balance < 0 ? 'text-red-500' : ''}`}>
                      {formatCurrency(account.balance)}
                    </p>
                  </Card>
                ))}
              </div>

              {/* Recent Transactions */}
              <Card className="mb-8">
                <div className="p-6 border-b" style={{ borderColor: 'rgb(var(--card-border))' }}>
                  <h3 className="text-lg font-bold">Letzte Transaktionen</h3>
                </div>
                <div className="divide-y" style={{ borderColor: 'rgb(var(--card-border))' }}>
                  {transactions.slice(0, 5).map(transaction => (
                    <div 
                      key={transaction.id}
                      className="p-4 hover:bg-[rgb(var(--bg-elevated))] transition-colors cursor-pointer flex items-center gap-4"
                    >
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                        style={{ backgroundColor: 'rgba(var(--accent), 0.1)' }}
                      >
                        {getCategoryIcon(transaction.category)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-semibold">{transaction.merchant}</h4>
                          <p className={`text-lg font-bold ${transaction.amount > 0 ? 'text-green-600 dark:text-green-400' : ''}`}>
                            {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                          </p>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-[rgb(var(--fg-subtle))]">{transaction.category}</p>
                          <p className="text-xs text-[rgb(var(--fg-subtle))]">
                            {formatDate(transaction.date)}
                            {transaction.status === 'pending' && (
                              <span className="ml-2 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs">
                                Ausstehend
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}

          {view === 'transactions' && (
            <Card>
              <div className="p-6 border-b" style={{ borderColor: 'rgb(var(--card-border))' }}>
                <h3 className="text-lg font-bold">Alle Transaktionen</h3>
              </div>
              <div className="divide-y" style={{ borderColor: 'rgb(var(--card-border))' }}>
                {transactions.map(transaction => (
                  <div 
                    key={transaction.id}
                    className="p-4 hover:bg-[rgb(var(--bg-elevated))] transition-colors cursor-pointer flex items-center gap-4"
                  >
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                      style={{ backgroundColor: 'rgba(var(--accent), 0.1)' }}
                    >
                      {getCategoryIcon(transaction.category)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold">{transaction.merchant}</h4>
                        <p className={`text-lg font-bold ${transaction.amount > 0 ? 'text-green-600 dark:text-green-400' : ''}`}>
                          {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                        </p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-[rgb(var(--fg-subtle))]">{transaction.category}</p>
                        <p className="text-xs text-[rgb(var(--fg-subtle))]">
                          {formatDate(transaction.date)}
                          {transaction.status === 'pending' && (
                            <span className="ml-2 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs">
                              Ausstehend
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {view === 'budgets' && (
            <>
              {/* Budget Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="p-6">
                  <p className="text-sm text-[rgb(var(--fg-subtle))]">Budget gesamt</p>
                  <p className="text-3xl font-bold mt-2">{formatCurrency(totalBudgeted)}</p>
                </Card>
                <Card className="p-6">
                  <p className="text-sm text-[rgb(var(--fg-subtle))]">Ausgegeben</p>
                  <p className="text-3xl font-bold mt-2">{formatCurrency(totalSpent)}</p>
                </Card>
                <Card className="p-6">
                  <p className="text-sm text-[rgb(var(--fg-subtle))]">Übrig</p>
                  <p className="text-3xl font-bold mt-2 text-green-600 dark:text-green-400">
                    {formatCurrency(totalBudgeted - totalSpent)}
                  </p>
                </Card>
              </div>

              {/* Budget Breakdown */}
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-6">Budget-Übersicht</h3>
                <div className="space-y-6">
                  {budgets.map(budget => {
                    const percentage = (budget.spent / budget.budgeted) * 100
                    return (
                      <div key={budget.id}>
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{budget.icon}</span>
                            <span className="font-medium">{budget.category}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-mono font-bold">
                              {formatCurrency(budget.spent)} / {formatCurrency(budget.budgeted)}
                            </p>
                            <p className="text-xs text-[rgb(var(--fg-subtle))]">
                              {percentage.toFixed(0)}% genutzt
                            </p>
                          </div>
                        </div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-3 rounded-full transition-all ${getProgressColor(budget.spent, budget.budgeted)}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                        {percentage >= 90 && (
                          <p className="text-xs text-red-500 mt-1">
                            ⚠️ Budget fast aufgebraucht!
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
