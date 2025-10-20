/**
 * Auth Context
 * 
 * Verwaltet Authentication State global in der App
 */

'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

// API_URL dynamisch ermitteln:
// - Im Browser: Verwende die aktuelle Origin (funktioniert mit localhost, Tailscale IP, oder DNS)
// - Bei NEXT_PUBLIC_API_URL gesetzt: Verwende diese URL
// - Ansonsten: Leerer String für relative Pfade über Nginx
const getApiUrl = () => {
  // Prüfe ob wir im Browser sind
  if (typeof window !== 'undefined') {
    // Verwende die aktuelle Origin (z.B. http://100.81.184.55 oder http://nas-timgreen01)
    return window.location.origin
  }
  // Server-seitig: Verwende ENV oder leer
  return process.env.NEXT_PUBLIC_API_URL || ''
}

const API_URL = getApiUrl()

// Axios Instanz mit Timeout
const api = axios.create({
  timeout: 10000, // 10 Sekunden Timeout
  headers: {
    'Content-Type': 'application/json'
  }
})

interface User {
  id: string
  username: string
  email: string
  createdAt: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateProfile: (payload: { username?: string; email?: string; password?: string }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Token aus localStorage laden beim Start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          // User-Daten vom Backend holen
          const res = await api.get(`${API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          setUser(res.data.user)
        } catch (error) {
          // Token ungültig - entfernen
          localStorage.removeItem('token')
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (username: string, password: string) => {
    const res = await api.post(`${API_URL}/api/auth/login`, {
      username,
      password
    })
    
    const { token, user } = res.data
    localStorage.setItem('token', token)
    setUser(user)
  }

  const register = async (username: string, email: string, password: string) => {
    const res = await api.post(`${API_URL}/api/auth/register`, {
      username,
      email,
      password
    })
    
    const { token, user } = res.data
    localStorage.setItem('token', token)
    setUser(user)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const updateProfile = async (payload: { username?: string; email?: string; password?: string }) => {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Not authenticated')

    const res = await api.patch(`${API_URL}/api/auth/me`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    })

    const { token: newToken, user: updatedUser } = res.data
    if (newToken) localStorage.setItem('token', newToken)
    setUser(updatedUser)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
