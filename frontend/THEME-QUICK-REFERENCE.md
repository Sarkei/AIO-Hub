# 🎨 Theme System - Quick Reference

## 🚀 Schnellstart

### Theme umschalten
```tsx
import { useTheme } from '@/context/ThemeContext'

function MyComponent() {
  const { theme, toggleTheme } = useTheme()
  
  return (
    <button onClick={toggleTheme}>
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
```

---

## 📋 Farb-Tokens (Copy & Paste)

### Surfaces (Backgrounds)
```tsx
// Page Background
style={{ backgroundColor: 'rgb(var(--bg))' }}

// Cards & Panels
style={{ backgroundColor: 'rgb(var(--card))' }}

// Card Borders
style={{ borderColor: 'rgb(var(--card-border))' }}
```

### Text Colors
```tsx
// Primary Text (Headlines, Body)
style={{ color: 'rgb(var(--fg))' }}

// Secondary Text (Subtitles, Meta)
style={{ color: 'rgb(var(--fg-muted))' }}

// Tertiary Text (Placeholders)
style={{ color: 'rgb(var(--fg-subtle))' }}
```

### Brand Colors
```tsx
// Primary Accent
style={{ color: 'rgb(var(--accent))' }}

// Hover State
style={{ color: 'rgb(var(--accent-hover))' }}

// Subtle Background (12% opacity)
style={{ backgroundColor: 'rgba(var(--accent), 0.12)' }}
```

### Semantic Colors
```tsx
// Success (Green)
style={{ color: 'rgb(var(--success))' }}

// Warning (Amber)
style={{ color: 'rgb(var(--warning))' }}

// Danger (Red)
style={{ color: 'rgb(var(--danger))' }}

// Info (Blue)
style={{ color: 'rgb(var(--info))' }}
```

---

## 🎨 Component Primitives

### Buttons
```tsx
// Primary
<button className="btn btn-primary">Speichern</button>

// Secondary
<button className="btn btn-secondary">Abbrechen</button>

// Danger
<button className="btn btn-danger">Löschen</button>

// Ghost
<button className="btn btn-ghost">Details</button>
```

### Inputs
```tsx
// Normal
<input className="input" placeholder="Text" />

// Error
<input className="input input-error" />

// Disabled
<input className="input" disabled />
```

### Cards
```tsx
<div className="card">
  <div className="card-header">
    <h3>Title</h3>
  </div>
  <div className="p-6">
    Content
  </div>
</div>
```

### Badges
```tsx
// Default
<span className="badge">Neu</span>

// Success
<span className="badge badge-success">Erledigt</span>

// Warning
<span className="badge badge-warning">Warnung</span>

// Danger
<span className="badge badge-danger">Fehler</span>
```

---

## 🎯 Common Patterns

### Alert Box
```tsx
<div 
  className="p-4 rounded-lg border"
  style={{
    backgroundColor: 'rgba(var(--success), 0.1)',
    borderColor: 'rgba(var(--success), 0.3)',
    color: 'rgb(var(--success))'
  }}
>
  ✅ Erfolgreich gespeichert!
</div>
```

### Hover Card
```tsx
<div 
  className="card cursor-pointer transition-all"
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateY(-4px)'
    e.currentTarget.style.borderColor = 'rgb(var(--accent))'
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'translateY(0)'
    e.currentTarget.style.borderColor = 'rgb(var(--card-border))'
  }}
>
  Hover me!
</div>
```

### Gradient Button
```tsx
<button 
  className="btn"
  style={{
    background: 'linear-gradient(135deg, rgb(var(--accent)) 0%, rgb(var(--accent-hover)) 100%)',
    color: 'white'
  }}
>
  Gradient
</button>
```

---

## 🛠️ Design Tokens

### Shadows
```css
--shadow-xs   /* Subtle borders */
--shadow-sm   /* Cards at rest */
--shadow      /* Cards on hover */
--shadow-md   /* Buttons on hover */
--shadow-lg   /* Dropdowns, modals */
--shadow-xl   /* Popovers, tooltips */
```

### Border Radius
```css
--radius-xs   /* 4px - badges */
--radius-sm   /* 6px - inputs, buttons */
--radius      /* 8px - default */
--radius-md   /* 12px - larger cards */
--radius-lg   /* 16px - panels */
--radius-xl   /* 24px - hero elements */
--radius-full /* 9999px - circles */
```

### Transitions
```css
--transition-fast /* 150ms - hover */
--transition-base /* 200ms - standard */
--transition-slow /* 300ms - theme switch */
```

---

## 📏 WCAG Contrast Ratios

| Element | Light Mode | Dark Mode | WCAG |
|---------|-----------|-----------|------|
| Primary Text | 10.5:1 | 13.6:1 | AAA ✅ |
| Secondary Text | 4.6:1 | 5.1:1 | AA ✅ |
| Button Text | 6.8:1 | 4.5:1 | AA ✅ |

---

## 🎯 Cheat Sheet

```tsx
// Color with opacity
backgroundColor: 'rgba(var(--accent), 0.12)'

// Smooth transition
transition: 'all var(--transition-fast)'

// Card shadow
boxShadow: 'var(--shadow-sm)'

// Border radius
borderRadius: 'var(--radius-lg)'

// Focus ring
boxShadow: '0 0 0 3px rgba(var(--ring), 0.35)'

// Theme-aware class
className="theme-transition"
```

---

## 🚨 Common Mistakes

### ❌ Don't:
```tsx
// Hardcoded colors
<div style={{ color: '#171717' }}>

// Wrong format
<div style={{ color: 'var(--fg)' }}> // Missing rgb()

// All transitions
transition: 'all 200ms' // Animates everything
```

### ✅ Do:
```tsx
// Use tokens
<div style={{ color: 'rgb(var(--fg))' }}>

// Correct format
<div style={{ color: 'rgb(var(--fg))' }}>

// Specific transitions
transition: 'background-color 200ms, border-color 200ms'
```

---

## 🔗 Links

- [Full Documentation](./THEME-SYSTEM.md)
- [ThemeContext.tsx](./src/context/ThemeContext.tsx)
- [globals.css](./src/app/globals.css)
