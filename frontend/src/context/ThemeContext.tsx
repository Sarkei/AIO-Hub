/**
 * ════════════════════════════════════════════════════════════════════════════
 * 🎨 Theme Context - Dark Mode First Theme System
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * Architecture:
 * - Dark Mode = Default (app starts in dark theme)
 * - Light Mode = Optional (user can toggle via ThemeToggle component)
 * - Theme preference persists in localStorage
 * - Flash-prevention via inline script in layout.tsx
 * 
 * Usage:
 * ```tsx
 * import { useTheme } from '@/context/ThemeContext'
 * 
 * function MyComponent() {
 *   const { theme, toggleTheme, setTheme } = useTheme()
 *   
 *   return (
 *     <button onClick={toggleTheme}>
 *       {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
 *     </button>
 *   )
 * }
 * ```
 * 
 * Technical Flow:
 * 1. Inline script in layout.tsx reads localStorage BEFORE React hydration
 * 2. Sets .dark class on <html> to prevent white flash
 * 3. ThemeProvider reads same localStorage and syncs React state
 * 4. User toggles → localStorage updated → .dark class toggled → CSS variables switch
 * 
 * @see frontend/THEME-SYSTEM.md for full documentation
 */

'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

// ════════════════════════════════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════════════════════════════════

type Theme = 'light' | 'dark'

interface ThemeContextType {
  /** Current active theme ('light' or 'dark') */
  theme: Theme
  /** Toggle between light and dark mode */
  toggleTheme: () => void
  /** Set theme explicitly (useful for settings UI) */
  setTheme: (t: Theme) => void
}

// ════════════════════════════════════════════════════════════════════════════
// Context
// ════════════════════════════════════════════════════════════════════════════

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// ════════════════════════════════════════════════════════════════════════════
// Provider Component
// ════════════════════════════════════════════════════════════════════════════

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initial state is 'light' to prevent SSR mismatch
  // Real theme is set in useEffect after reading localStorage
  const [theme, setThemeState] = useState<Theme>('light')

  /**
   * ──────────────────────────────────────────────────────────────────────────
   * Initialize Theme on Mount
   * ──────────────────────────────────────────────────────────────────────────
   * 
   * Priority:
   * 1. User's saved preference (localStorage)
   * 2. Dark Mode (default fallback)
   * 
   * Note: This runs AFTER the inline script in layout.tsx has already
   * set the .dark class, so we're just syncing React state here.
   */
  useEffect(() => {
    try {
      const stored = localStorage.getItem('theme') as Theme | null
      if (stored === 'light' || stored === 'dark') {
        setThemeState(stored)
        document.documentElement.classList.toggle('dark', stored === 'dark')
        return
      }
    } catch (error) {
      // LocalStorage might be blocked (privacy mode, cookies disabled)
      console.warn('Theme: localStorage unavailable, using default')
    }
    
    // 🌙 DEFAULT: Dark Mode (as per requirements)
    // App starts in dark theme if no preference is saved
    setThemeState('dark')
    document.documentElement.classList.toggle('dark', true)
  }, [])

  /**
   * ──────────────────────────────────────────────────────────────────────────
   * Set Theme Function
   * ──────────────────────────────────────────────────────────────────────────
   * 
   * Updates:
   * 1. React state (for UI re-renders)
   * 2. localStorage (for persistence)
   * 3. .dark class on <html> (triggers CSS variable switch)
   * 
   * Transitions are handled by CSS (see globals.css)
   */
  const setTheme = (t: Theme) => {
    setThemeState(t)
    
    // Persist to localStorage (gracefully fail if unavailable)
    try { 
      localStorage.setItem('theme', t) 
    } catch (error) {
      console.warn('Theme: Failed to save preference')
    }
    
    // Toggle .dark class on <html> element
    // This switches all CSS variables from :root to .dark
    document.documentElement.classList.toggle('dark', t === 'dark')
  }

  /**
   * ──────────────────────────────────────────────────────────────────────────
   * Toggle Theme Function
   * ──────────────────────────────────────────────────────────────────────────
   * 
   * Convenience function for theme switcher buttons
   * Switches between 'dark' ↔ 'light'
   */
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Hook
// ════════════════════════════════════════════════════════════════════════════

/**
 * useTheme Hook
 * 
 * Access theme state and controls from any component
 * 
 * @throws Error if used outside ThemeProvider
 * 
 * @example
 * ```tsx
 * const { theme, toggleTheme } = useTheme()
 * 
 * <button onClick={toggleTheme}>
 *   Toggle to {theme === 'dark' ? 'Light' : 'Dark'} Mode
 * </button>
 * ```
 */
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return ctx
}
