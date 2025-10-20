'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import AppLayout from '@/components/AppLayout'

export default function SettingsPage() {
  const { user, loading, updateProfile } = useAuth()
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

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
      setMessage('Profil erfolgreich aktualisiert')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Aktualisierung fehlgeschlagen')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6">⚙️ Einstellungen</h1>
        <form onSubmit={onSave} className="space-y-6 card p-6">
          <div>
            <label className="block text-sm font-medium mb-1">Benutzername</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">E-Mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Neues Passwort</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leer lassen, um nicht zu ändern"
              className="input"
            />
          </div>

          {message && <div className="text-sm" style={{ color: 'rgb(var(--success))' }}>{message}</div>}
          {error && <div className="text-sm" style={{ color: 'rgb(var(--danger))' }}>{error}</div>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn btn-secondary"
            >
              Zurück
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary disabled:opacity-50"
            >
              {saving ? 'Speichern…' : 'Speichern'}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
