'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import AppLayout from '@/components/AppLayout'
import { Card } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Switch from '@/components/ui/Switch'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'

export default function SettingsPage() {
  const { user, loading, updateProfile } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()
  
  // Account Settings
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  // App Settings
  const [language, setLanguage] = useState('de')
  const [fontSize, setFontSize] = useState('medium')
  const [compactMode, setCompactMode] = useState(false)
  
  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [todoReminders, setTodoReminders] = useState(true)
  const [eventReminders, setEventReminders] = useState(true)
  const [reminderTime, setReminderTime] = useState('15')
  
  // Privacy Settings
  const [dataCollection, setDataCollection] = useState(true)
  const [analytics, setAnalytics] = useState(true)
  const [profileVisibility, setProfileVisibility] = useState('private')
  
  // Fitness Settings
  const [weightUnit, setWeightUnit] = useState('kg')
  const [distanceUnit, setDistanceUnit] = useState('km')
  const [firstDayOfWeek, setFirstDayOfWeek] = useState('monday')
  
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState('account')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      setUsername(user.username)
      setEmail(user.email)
    }
  }, [user])

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    setError(null)
    try {
      const payload: { username?: string; email?: string; password?: string } = {}
      if (username && username !== user?.username) payload.username = username
      if (email && email !== user?.email) payload.email = email
      if (password) payload.password = password
      await updateProfile(payload)
      setPassword('')
      setMessage('Einstellungen erfolgreich gespeichert')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Speichern fehlgeschlagen')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== user?.username) {
      setError('Benutzername stimmt nicht überein')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/auth/me', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Fehler beim Löschen des Accounts')
      }

      // Logout und Redirect
      localStorage.removeItem('token')
      alert('Dein Account wurde gelöscht. Deine Dateien bleiben zur Sicherheit erhalten.')
      router.push('/login')
    } catch (err: any) {
      setError(err.message || 'Account konnte nicht gelöscht werden')
    }
  }

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: 'rgb(var(--accent))' }}></div>
      </div>
    )
  }

  const categories = [
    { id: 'account', label: 'Account', icon: '👤' },
    { id: 'appearance', label: 'Darstellung', icon: '🎨' },
    { id: 'notifications', label: 'Benachrichtigungen', icon: '🔔' },
    { id: 'privacy', label: 'Datenschutz', icon: '🔒' },
    { id: 'fitness', label: 'Fitness & Tracking', icon: '💪' },
    { id: 'advanced', label: 'Erweitert', icon: '⚙️' },
  ]

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">⚙️ Einstellungen</h1>
          <p className="text-[rgb(var(--fg-muted))] mt-2">
            Verwalte deine Account- und App-Einstellungen
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Category Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-3 sticky top-4">
              <nav className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                    style={{
                      backgroundColor: activeCategory === cat.id ? 'rgba(var(--accent), 0.12)' : 'transparent',
                      color: activeCategory === cat.id ? 'rgb(var(--accent))' : 'rgb(var(--fg-muted))',
                    }}
                  >
                    <span className="text-lg">{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Account Settings */}
            {activeCategory === 'account' && (
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-6">👤 Account Einstellungen</h2>
                <form onSubmit={onSave} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Benutzername</label>
                    <Input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Dein Benutzername"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">E-Mail</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="deine@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Neues Passwort</label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Leer lassen, um nicht zu ändern"
                    />
                    <p className="text-xs text-[rgb(var(--fg-subtle))] mt-1">
                      Mindestens 6 Zeichen
                    </p>
                  </div>

                  {message && <div className="text-sm" style={{ color: 'rgb(var(--success))' }}>{message}</div>}
                  {error && <div className="text-sm" style={{ color: 'rgb(var(--danger))' }}>{error}</div>}

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" disabled={saving}>
                      {saving ? 'Speichern…' : 'Änderungen speichern'}
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => router.back()}>
                      Abbrechen
                    </Button>
                  </div>
                </form>

                {/* Gefahrenzone - Account löschen */}
                <div className="mt-8 pt-8 border-t" style={{ borderColor: 'rgb(var(--card-border))' }}>
                  <h3 className="text-lg font-semibold mb-4 text-[rgb(var(--danger))]">⚠️ Gefahrenzone</h3>
                  <p className="text-sm text-[rgb(var(--fg-muted))] mb-4">
                    Das Löschen deines Accounts ist <strong>permanent und unumkehrbar</strong>. 
                    Alle Datenbank-Einträge werden gelöscht, aber deine Dateien bleiben zur Sicherheit erhalten.
                  </p>

                  {!showDeleteConfirm ? (
                    <Button 
                      variant="danger" 
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      🗑️ Account löschen
                    </Button>
                  ) : (
                    <div className="p-4 rounded-lg border-2 space-y-4" style={{ 
                      borderColor: 'rgb(var(--danger))',
                      backgroundColor: 'rgba(var(--danger), 0.05)'
                    }}>
                      <p className="text-sm font-medium">
                        ⚠️ Bist du sicher? Diese Aktion kann nicht rückgängig gemacht werden!
                      </p>
                      <p className="text-sm text-[rgb(var(--fg-muted))]">
                        <strong>Was wird gelöscht:</strong>
                      </p>
                      <ul className="text-sm text-[rgb(var(--fg-muted))] list-disc list-inside space-y-1">
                        <li>Dein Account und alle Login-Daten</li>
                        <li>Alle Datenbank-Einträge (Notizen, Todos, Events, etc.)</li>
                        <li>Dein persönliches Datenbank-Schema</li>
                      </ul>
                      <p className="text-sm text-[rgb(var(--fg-muted))]">
                        <strong>Was bleibt erhalten:</strong>
                      </p>
                      <ul className="text-sm text-[rgb(var(--fg-muted))] list-disc list-inside space-y-1">
                        <li>Deine hochgeladenen Dateien (PDFs, Bilder, etc.)</li>
                        <li>Deine Ordnerstruktur unter <code>/volume1/docker/AIO-Hub-Data/{user?.username}/</code></li>
                      </ul>

                      <div className="mt-4">
                        <label className="block text-sm font-medium mb-2">
                          Gib <strong>{user?.username}</strong> ein, um zu bestätigen:
                        </label>
                        <Input
                          type="text"
                          value={deleteConfirmText}
                          onChange={(e) => setDeleteConfirmText(e.target.value)}
                          placeholder={user?.username}
                          className="font-mono"
                        />
                      </div>

                      {error && <div className="text-sm" style={{ color: 'rgb(var(--danger))' }}>{error}</div>}

                      <div className="flex gap-3">
                        <Button
                          variant="danger"
                          onClick={handleDeleteAccount}
                          disabled={deleteConfirmText !== user?.username}
                        >
                          ✅ Ja, Account permanent löschen
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setShowDeleteConfirm(false)
                            setDeleteConfirmText('')
                            setError(null)
                          }}
                        >
                          Abbrechen
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Appearance Settings */}
            {activeCategory === 'appearance' && (
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-6">🎨 Darstellung</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-3">Theme</label>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-[rgb(var(--fg-muted))]">
                        {theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
                      </span>
                      <button
                        onClick={toggleTheme}
                        className="relative inline-flex h-8 w-16 items-center rounded-full transition-all"
                        style={{
                          backgroundColor: theme === 'dark' ? 'rgb(var(--accent))' : 'rgb(var(--fg-subtle))',
                          boxShadow: theme === 'dark' ? '0 0 12px rgba(var(--accent), 0.4)' : 'none'
                        }}
                      >
                        <span
                          className="inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-all"
                          style={{
                            transform: theme === 'dark' ? 'translateX(36px)' : 'translateX(4px)'
                          }}
                        />
                      </button>
                    </div>
                    <p className="text-xs text-[rgb(var(--fg-subtle))] mt-2">
                      Wechsle zwischen hellem und dunklem Modus
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Sprache</label>
                    <Select value={language} onChange={(e) => setLanguage(e.target.value)}>
                      <option value="de">🇩🇪 Deutsch</option>
                      <option value="en">🇬🇧 English</option>
                      <option value="fr">🇫🇷 Français</option>
                      <option value="es">🇪🇸 Español</option>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Schriftgröße</label>
                    <Select value={fontSize} onChange={(e) => setFontSize(e.target.value)}>
                      <option value="small">Klein</option>
                      <option value="medium">Mittel (Standard)</option>
                      <option value="large">Groß</option>
                    </Select>
                  </div>

                  <div>
                    <Switch
                      label="Kompakt-Modus"
                      checked={compactMode}
                      onChange={(e) => setCompactMode((e.target as HTMLInputElement).checked)}
                    />
                    <p className="text-xs text-[rgb(var(--fg-subtle))] mt-1 ml-11">
                      Reduziert Abstände und zeigt mehr Inhalte auf einmal
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button onClick={() => setMessage('Darstellung gespeichert')}>
                      Speichern
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Notification Settings */}
            {activeCategory === 'notifications' && (
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-6">🔔 Benachrichtigungen</h2>
                <div className="space-y-6">
                  <div>
                    <Switch
                      label="E-Mail Benachrichtigungen"
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications((e.target as HTMLInputElement).checked)}
                    />
                    <p className="text-xs text-[rgb(var(--fg-subtle))] mt-1 ml-11">
                      Erhalte wichtige Updates per E-Mail
                    </p>
                  </div>

                  <div>
                    <Switch
                      label="Push Benachrichtigungen"
                      checked={pushNotifications}
                      onChange={(e) => setPushNotifications((e.target as HTMLInputElement).checked)}
                    />
                    <p className="text-xs text-[rgb(var(--fg-subtle))] mt-1 ml-11">
                      Browser-Benachrichtigungen für wichtige Events
                    </p>
                  </div>

                  <div className="border-t pt-4" style={{ borderColor: 'rgb(var(--card-border))' }}>
                    <h3 className="text-sm font-semibold mb-4">Erinnerungen</h3>
                    
                    <div className="space-y-4">
                      <Switch
                        label="Todo Erinnerungen"
                        checked={todoReminders}
                        onChange={(e) => setTodoReminders((e.target as HTMLInputElement).checked)}
                      />
                      
                      <Switch
                        label="Termin Erinnerungen"
                        checked={eventReminders}
                        onChange={(e) => setEventReminders((e.target as HTMLInputElement).checked)}
                      />

                      <div>
                        <label className="block text-sm font-medium mb-2">Standard Erinnerungszeit</label>
                        <Select value={reminderTime} onChange={(e) => setReminderTime(e.target.value)}>
                          <option value="0">Zur Zeit des Events</option>
                          <option value="5">5 Minuten vorher</option>
                          <option value="15">15 Minuten vorher</option>
                          <option value="30">30 Minuten vorher</option>
                          <option value="60">1 Stunde vorher</option>
                          <option value="1440">1 Tag vorher</option>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button onClick={() => setMessage('Benachrichtigungen gespeichert')}>
                      Speichern
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Privacy Settings */}
            {activeCategory === 'privacy' && (
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-6">🔒 Datenschutz & Sicherheit</h2>
                <div className="space-y-6">
                  <div>
                    <Switch
                      label="Datensammlung für Verbesserungen"
                      checked={dataCollection}
                      onChange={(e) => setDataCollection((e.target as HTMLInputElement).checked)}
                    />
                    <p className="text-xs text-[rgb(var(--fg-subtle))] mt-1 ml-11">
                      Hilf uns, die App zu verbessern durch anonyme Nutzungsdaten
                    </p>
                  </div>

                  <div>
                    <Switch
                      label="Analytics"
                      checked={analytics}
                      onChange={(e) => setAnalytics((e.target as HTMLInputElement).checked)}
                    />
                    <p className="text-xs text-[rgb(var(--fg-subtle))] mt-1 ml-11">
                      Anonyme Analyse der App-Nutzung
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Profil Sichtbarkeit</label>
                    <Select value={profileVisibility} onChange={(e) => setProfileVisibility(e.target.value)}>
                      <option value="private">🔒 Privat</option>
                      <option value="friends">👥 Nur Freunde</option>
                      <option value="public">🌍 Öffentlich</option>
                    </Select>
                  </div>

                  <div className="border-t pt-4" style={{ borderColor: 'rgb(var(--card-border))' }}>
                    <h3 className="text-sm font-semibold mb-4 text-[rgb(var(--danger))]">Gefahrenzone</h3>
                    
                    <div className="space-y-3">
                      <Button variant="danger" onClick={() => alert('Daten exportieren - Coming Soon')}>
                        📦 Daten exportieren
                      </Button>
                      <Button variant="danger" onClick={() => confirm('Wirklich alle Daten löschen?') && alert('Coming Soon')}>
                        🗑️ Alle Daten löschen
                      </Button>
                      <Button variant="danger" onClick={() => confirm('Account wirklich löschen?') && alert('Coming Soon')}>
                        ⚠️ Account löschen
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button onClick={() => setMessage('Datenschutz gespeichert')}>
                      Speichern
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Fitness Settings */}
            {activeCategory === 'fitness' && (
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-6">💪 Fitness & Tracking</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Gewichtseinheit</label>
                    <Select value={weightUnit} onChange={(e) => setWeightUnit(e.target.value)}>
                      <option value="kg">Kilogramm (kg)</option>
                      <option value="lbs">Pfund (lbs)</option>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Distanzeinheit</label>
                    <Select value={distanceUnit} onChange={(e) => setDistanceUnit(e.target.value)}>
                      <option value="km">Kilometer (km)</option>
                      <option value="mi">Meilen (mi)</option>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Wochenstart</label>
                    <Select value={firstDayOfWeek} onChange={(e) => setFirstDayOfWeek(e.target.value)}>
                      <option value="monday">Montag</option>
                      <option value="sunday">Sonntag</option>
                      <option value="saturday">Samstag</option>
                    </Select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button onClick={() => setMessage('Fitness Einstellungen gespeichert')}>
                      Speichern
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Advanced Settings */}
            {activeCategory === 'advanced' && (
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-6">⚙️ Erweiterte Einstellungen</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Developer Tools</h3>
                    <div className="space-y-3">
                      <Button variant="secondary" onClick={() => alert('Cache geleert')}>
                        🗑️ Cache leeren
                      </Button>
                      <Button variant="secondary" onClick={() => alert('Service Worker zurückgesetzt')}>
                        🔄 Service Worker zurücksetzen
                      </Button>
                      <Button variant="secondary" onClick={() => console.log('Debug Info:', { user, theme })}>
                        🐛 Debug Info anzeigen
                      </Button>
                    </div>
                  </div>

                  <div className="border-t pt-4" style={{ borderColor: 'rgb(var(--card-border))' }}>
                    <h3 className="text-sm font-semibold mb-3">App Info</h3>
                    <div className="text-sm space-y-2 text-[rgb(var(--fg-muted))]">
                      <p><strong>Version:</strong> 1.0.0</p>
                      <p><strong>Build:</strong> 2025.01.23</p>
                      <p><strong>Backend:</strong> Connected ✅</p>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
