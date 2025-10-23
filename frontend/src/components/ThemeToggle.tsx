/**
 * ════════════════════════════════════════════════════════════════════════════
 * 🌓 Theme Toggle - Animated Switch Component
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * Features:
 * - iOS-style toggle switch (not just button)
 * - Smooth sliding animation (300ms)
 * - Icon transition (sun ↔ moon)
 * - Glow effect on active state
 * - Accessible keyboard navigation
 * 
 * Microinteractions:
 * - Circle slides left/right
 * - Background color transition
 * - Icon fade in/out
 * - Hover: slight scale up (1.05)
 */

'use client'

import { useTheme } from '@/context/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="relative w-full px-3 py-2.5 rounded-lg flex items-center gap-3 group transition-all"
      style={{
        backgroundColor: isDark 
          ? 'rgba(var(--accent), 0.12)' 
          : 'rgba(var(--warning), 0.12)',
        border: `1px solid ${isDark 
          ? 'rgba(var(--accent), 0.3)' 
          : 'rgba(var(--warning), 0.3)'}`,
        transition: 'all var(--transition-base)',
        transform: 'scale(1)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.02)'
        e.currentTarget.style.borderColor = isDark 
          ? 'rgb(var(--accent))' 
          : 'rgb(var(--warning))'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.borderColor = isDark 
          ? 'rgba(var(--accent), 0.3)' 
          : 'rgba(var(--warning), 0.3)'
      }}
      aria-label="Toggle theme"
      title={`Zu ${isDark ? 'Light' : 'Dark'} Mode wechseln`}
    >
      {/* Toggle Switch */}
      <div 
        className="relative w-12 h-6 rounded-full flex items-center"
        style={{
          backgroundColor: isDark 
            ? 'rgb(var(--accent))' 
            : 'rgb(var(--warning))',
          boxShadow: isDark 
            ? '0 0 12px rgba(var(--accent), 0.4)' 
            : '0 0 12px rgba(var(--warning), 0.4)',
          transition: 'all var(--transition-slow)'
        }}
      >
        {/* Sliding Circle */}
        <div 
          className="absolute w-5 h-5 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: 'white',
            left: isDark ? '4px' : 'calc(100% - 24px)',
            transition: 'left var(--transition-slow)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          {/* Icon inside circle */}
          <span className="text-xs">
            {isDark ? '🌙' : '☀️'}
          </span>
        </div>
      </div>
      
      {/* Label */}
      <span 
        className="text-sm font-medium"
        style={{ 
          color: isDark 
            ? 'rgb(var(--accent))' 
            : 'rgb(var(--warning))'
        }}
      >
        {isDark ? 'Dark Mode' : 'Light Mode'}
      </span>
    </button>
  )
}
