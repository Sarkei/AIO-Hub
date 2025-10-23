/**
 * Login Page - Modern Card-Based Design
 * Inspired by: Notion, Revolut, Todoist, Spotify
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Label from '@/components/ui/Label'

export default function LoginPage() {
  const router = useRouter()
  const { login, user, loading: authLoading } = useAuth()
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Redirect wenn bereits eingeloggt
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard')
    }
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(formData.username, formData.password)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login fehlgeschlagen')
      setLoading(false)
    }
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8"
      style={{ backgroundColor: 'rgb(var(--bg))' }}
    >
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 elevate"
               style={{ background: 'linear-gradient(135deg, rgb(var(--accent)) 0%, rgb(var(--accent-hover)) 100%)' }}>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'rgb(var(--fg))' }}>
            Willkommen zurück
          </h1>
          <p className="text-sm" style={{ color: 'rgb(var(--fg-muted))' }}>
            Melde dich an, um fortzufahren
          </p>
        </div>

        {/* Login Card */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username">
                Benutzername oder E-Mail
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5" style={{ color: 'rgb(var(--fg-subtle))' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  required
                  autoComplete="username"
                  className="pl-10"
                  placeholder="max.mustermann"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">
                Passwort
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5" style={{ color: 'rgb(var(--fg-subtle))' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="pl-10"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div 
                className="p-4 rounded-lg border"
                style={{ 
                  backgroundColor: 'rgba(var(--danger), 0.1)',
                  borderColor: 'rgba(var(--danger), 0.3)',
                  color: 'rgb(var(--danger))'
                }}
              >
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" 
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Wird angemeldet...
                </>
              ) : (
                'Anmelden'
              )}
            </Button>
          </form>
        </div>

        {/* Register Link */}
        <div className="mt-6 text-center">
          <p className="text-sm" style={{ color: 'rgb(var(--fg-muted))' }}>
            Noch kein Konto?{' '}
            <Link
              href="/register"
              className="font-medium transition-colors"
              style={{ color: 'rgb(var(--accent))' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'rgb(var(--accent-hover))'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgb(var(--accent))'}
            >
              Jetzt registrieren →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
