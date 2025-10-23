/**
 * Register Page - Modern Card-Based Design
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

export default function RegisterPage() {
  const router = useRouter()
  const { register, user, loading: authLoading } = useAuth()
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwörter stimmen nicht überein')
      return
    }

    setLoading(true)

    try {
      await register(formData.username, formData.email, formData.password)
      router.push('/dashboard')
    } catch (err: any) {
      console.error('Registration error:', err)
      const errorMessage = err.response?.data?.message 
        || err.response?.data?.error 
        || err.message 
        || 'Registrierung fehlgeschlagen'
      setError(errorMessage)
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
            Konto erstellen
          </h1>
          <p className="text-sm" style={{ color: 'rgb(var(--fg-muted))' }}>
            Starte jetzt mit AIO Hub
          </p>
        </div>

        {/* Register Card */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username">
                Benutzername
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

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">
                E-Mail
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5" style={{ color: 'rgb(var(--fg-subtle))' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="pl-10"
                  placeholder="max@beispiel.de"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                  autoComplete="new-password"
                  className="pl-10"
                  placeholder="Mindestens 8 Zeichen"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                Passwort bestätigen
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5" style={{ color: 'rgb(var(--fg-subtle))' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  autoComplete="new-password"
                  className="pl-10"
                  placeholder="Passwort wiederholen"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
                  Konto wird erstellt...
                </>
              ) : (
                'Registrieren'
              )}
            </Button>
          </form>
        </div>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-sm" style={{ color: 'rgb(var(--fg-muted))' }}>
            Bereits ein Konto?{' '}
            <Link
              href="/login"
              className="font-medium transition-colors"
              style={{ color: 'rgb(var(--accent))' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'rgb(var(--accent-hover))'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgb(var(--accent))'}
            >
              Jetzt anmelden →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
