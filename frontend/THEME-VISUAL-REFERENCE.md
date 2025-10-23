# 🎨 Theme System - Visual Reference

## 📊 Color Palette Overview

### Light Mode Palette
```
Page Background:    ▓▓▓▓▓▓▓▓ #FAFAFA (Notion-inspired neutral)
Elevated Surface:   ████████ #FFFFFF (Pure white)
Card Background:    ████████ #FFFFFF
Card Border:        ░░░░░░░░ #E5E7EB (Subtle gray)

Primary Text:       ████████ #171717 (Almost black)
Secondary Text:     ▓▓▓▓▓▓▓▓ #737373 (Medium gray)
Tertiary Text:      ░░░░░░░░ #A3A3A3 (Light gray)

Brand Accent:       ████████ #2563EB (Blue 600)
Accent Hover:       ████████ #1D4ED8 (Blue 700)
Accent Active:      ████████ #1E40AF (Blue 800)
```

### Dark Mode Palette (Default)
```
Page Background:    ████████ #0A0A0A (Almost black)
Elevated Surface:   ▓▓▓▓▓▓▓▓ #1A1A1A (Dark gray)
Card Background:    ▓▓▓▓▓▓▓▓ #1A1A1A
Card Border:        ░░░░░░░░ #262626 (Subtle border)

Primary Text:       ████████ #F5F5F5 (Off-white)
Secondary Text:     ▓▓▓▓▓▓▓▓ #A3A3A3 (Medium gray)
Tertiary Text:      ░░░░░░░░ #737373 (Dark gray)

Brand Accent:       ████████ #60A5FA (Blue 400)
Accent Hover:       ████████ #3B82F6 (Blue 500)
Accent Active:      ████████ #2563EB (Blue 600)
```

---

## 🎯 Component State Visualization

### Button States (Primary)

#### Light Mode
```
┌─────────────────────┐
│  Default: #2563EB   │  ← Normal state
└─────────────────────┘

┌─────────────────────┐
│  Hover: #1D4ED8     │  ← Darker + Shadow + translateY(-1px)
└─────────────────────┘
    ↑ Elevated

┌─────────────────────┐
│  Active: #1E40AF    │  ← Even darker + translateY(0)
└─────────────────────┘

┌─────────────────────┐
│  Disabled: 50%      │  ← Opacity reduced
└─────────────────────┘
```

#### Dark Mode
```
┌─────────────────────┐
│  Default: #60A5FA   │  ← Brighter for contrast
└─────────────────────┘

┌─────────────────────┐
│  Hover: #3B82F6     │  ← Less bright + Shadow + translateY(-1px)
└─────────────────────┘
    ↑ Elevated

┌─────────────────────┐
│  Active: #2563EB    │  ← Standard blue + translateY(0)
└─────────────────────┘

┌─────────────────────┐
│  Disabled: 50%      │  ← Opacity reduced
└─────────────────────┘
```

---

### Input States

#### Light Mode
```
┌────────────────────────────────┐
│ Username                       │  ← Default (gray border)
└────────────────────────────────┘

┌────────────────────────────────┐
│ Username                       │  ← Hover (accent border)
└────────────────────────────────┘
  ════════════════════════════════  Blue underline

┌────────────────────────────────┐
│ Username█                      │  ← Focus (accent border + ring)
└────────────────────────────────┘
   ●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●  Focus ring (3px)

┌────────────────────────────────┐
│ E-Mail ungültig                │  ← Error (red border)
└────────────────────────────────┘
  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  Red underline
```

---

### Card Elevation

```
Level 0 (Flat):
┌────────────────────────────────┐
│  No shadow, just border        │
└────────────────────────────────┘


Level 1 (Default):
╔════════════════════════════════╗
║  shadow-sm (1px blur)          ║
╚════════════════════════════════╝
   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Subtle shadow


Level 2 (Hover):
╔════════════════════════════════╗
║  shadow (3px blur)             ║
╚════════════════════════════════╝
   ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  Medium shadow


Level 3 (Dropdown):
╔════════════════════════════════╗
║  shadow-lg (15px blur)         ║
╚════════════════════════════════╝
   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  Strong shadow
```

---

## 🎭 Theme Comparison

### Login Page Comparison

#### Light Mode
```
┌────────────────────────────────────────┐
│              #FAFAFA Background        │  ← Neutral gray
│                                        │
│  ╔════════════════════════════════╗   │
│  ║  #FFFFFF Card                  ║   │  ← Pure white
│  ║                                ║   │
│  ║  ⚡ Gradient Logo              ║   │
│  ║                                ║   │
│  ║  #171717 Welcome Back          ║   │  ← Almost black text
│  ║  #737373 Sign in to continue   ║   │  ← Gray subtitle
│  ║                                ║   │
│  ║  ┌──────────────────────────┐ ║   │
│  ║  │ #FAFAFA Input Field      │ ║   │  ← Light gray input
│  ║  └──────────────────────────┘ ║   │
│  ║                                ║   │
│  ║  ┌──────────────────────────┐ ║   │
│  ║  │ #2563EB Sign In Button   │ ║   │  ← Blue button
│  ║  └──────────────────────────┘ ║   │
│  ║                                ║   │
│  ╚════════════════════════════════╝   │
│                                        │
└────────────────────────────────────────┘
```

#### Dark Mode (Default)
```
┌────────────────────────────────────────┐
│              #0A0A0A Background        │  ← Almost black
│                                        │
│  ╔════════════════════════════════╗   │
│  ║  #1A1A1A Card                  ║   │  ← Dark gray
│  ║                                ║   │
│  ║  ⚡ Gradient Logo              ║   │
│  ║                                ║   │
│  ║  #F5F5F5 Welcome Back          ║   │  ← Off-white text
│  ║  #A3A3A3 Sign in to continue   ║   │  ← Medium gray subtitle
│  ║                                ║   │
│  ║  ┌──────────────────────────┐ ║   │
│  ║  │ #0A0A0A Input Field      │ ║   │  ← Dark input
│  ║  └──────────────────────────┘ ║   │
│  ║                                ║   │
│  ║  ┌──────────────────────────┐ ║   │
│  ║  │ #60A5FA Sign In Button   │ ║   │  ← Bright blue button
│  ║  └──────────────────────────┘ ║   │
│  ║                                ║   │
│  ╚════════════════════════════════╝   │
│                                        │
└────────────────────────────────────────┘
```

---

## 📏 Spacing & Typography Scale

### Typography Hierarchy
```
Hero Text:        3xl (30px) - Bold   - #171717 / #F5F5F5
Page Title:       2xl (24px) - Bold   - #171717 / #F5F5F5
Section Title:    xl  (20px) - Semibold - #171717 / #F5F5F5
Card Title:       lg  (18px) - Semibold - #171717 / #F5F5F5
Body Text:        base(16px) - Regular - #171717 / #F5F5F5
Small Text:       sm  (14px) - Regular - #737373 / #A3A3A3
Meta Text:        xs  (12px) - Medium  - #A3A3A3 / #737373
```

### Spacing Scale
```
xs:  4px   ████
sm:  8px   ████████
md:  12px  ████████████
base: 16px ████████████████
lg:  24px  ████████████████████████
xl:  32px  ████████████████████████████████
2xl: 48px  ████████████████████████████████████████████████
```

---

## 🎨 Semantic Color Usage

### Success (Green)
```
┌────────────────────────────────┐
│  ✅ Successfully saved!        │  ← #10B981 icon + text
│  Changes applied.              │
└────────────────────────────────┘
  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  Success background (10% opacity)
```

### Warning (Amber)
```
┌────────────────────────────────┐
│  ⚠️ Please review your input   │  ← #F59E0B icon + text
│  Some fields need attention.   │
└────────────────────────────────┘
  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  Warning background (10% opacity)
```

### Danger (Red)
```
┌────────────────────────────────┐
│  ❌ Error: Action failed        │  ← #EF4444 icon + text
│  Please try again later.       │
└────────────────────────────────┘
  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  Danger background (10% opacity)
```

### Info (Blue)
```
┌────────────────────────────────┐
│  ℹ️ Tip: Use keyboard shortcuts│  ← #3B82F6 icon + text
│  Press Ctrl+K to open search.  │
└────────────────────────────────┘
  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  Info background (10% opacity)
```

---

## 🎯 Interactive Elements

### Toggle Switch (Theme Toggle)
```
Light Mode:
┌─────┐
│ ○   │  ← Circle left, background gray
└─────┘

Dark Mode:
┌─────┐
│   ● │  ← Circle right, background accent
└─────┘
```

### Checkbox States
```
Unchecked:
┌───┐
│   │  ← Empty box
└───┘

Checked:
┌───┐
│ ✓ │  ← Checkmark, accent background
└───┘

Disabled:
┌───┐
│ ░ │  ← Grayed out
└───┘
```

---

## 🌈 Gradient Examples

### Brand Gradient (Logo, Hero)
```
Linear Gradient (135deg):
████████████████████████████
#2563EB → #1D4ED8
(Blue 600 → Blue 700)
```

### Success Gradient (Completion)
```
Linear Gradient (135deg):
████████████████████████████
#10B981 → #059669
(Green 500 → Green 600)
```

### Dark Mode Overlay
```
Radial Gradient (center):
████████████████████████████
rgba(96, 165, 250, 0.1) → transparent
(Accent with fade-out)
```

---

## 📊 Contrast Ratio Matrix

```
                Light Mode              Dark Mode
┌────────────────────────────────────────────────────┐
│ Primary Text  │  10.5:1 ✅ AAA    │  13.6:1 ✅ AAA  │
│ Secondary     │   4.6:1 ✅ AA     │   5.1:1 ✅ AA   │
│ Tertiary      │   3.2:1 ⚠️        │   3.8:1 ⚠️      │
│ Button Text   │   6.8:1 ✅ AA     │   4.5:1 ✅ AA   │
│ Link Text     │   5.2:1 ✅ AA     │   4.9:1 ✅ AA   │
└────────────────────────────────────────────────────┘

Legend:
✅ AAA = 7:1+ (Excellent)
✅ AA  = 4.5:1+ (Good)
⚠️     = 3:1+ (Decorative only)
```

---

## 🎨 Design Token Values (Hex)

### Light Mode
```
--bg:              #FAFAFA
--bg-elevated:     #FFFFFF
--card:            #FFFFFF
--card-hover:      #F9FAFB
--card-border:     #E5E7EB

--fg:              #171717
--fg-muted:        #737373
--fg-subtle:       #A3A3A3

--accent:          #2563EB
--accent-hover:    #1D4ED8
--accent-active:   #1E40AF
--accent-subtle:   #EFF6FF

--success:         #10B981
--warning:         #F59E0B
--danger:          #EF4444
--info:            #3B82F6
```

### Dark Mode
```
--bg:              #0A0A0A
--bg-elevated:     #1A1A1A
--card:            #1A1A1A
--card-hover:      #262626
--card-border:     #262626

--fg:              #F5F5F5
--fg-muted:        #A3A3A3
--fg-subtle:       #737373

--accent:          #60A5FA
--accent-hover:    #3B82F6
--accent-active:   #2563EB
--accent-subtle:   #1E3A8A

--success:         #10B981
--warning:         #F59E0B
--danger:          #EF4444
--info:            #60A5FA
```

---

## 🎯 Common Use Cases

### Dashboard Card
```
┌────────────────────────────────────┐
│  📊 Quick Stats                    │  ← Card title
│                                    │
│  ┌───────┐ ┌───────┐ ┌───────┐   │
│  │ 4     │ │ 14:30 │ │ 5 days│   │  ← Stat cards
│  │ Todos │ │ Event │ │ Streak│   │
│  └───────┘ └───────┘ └───────┘   │
└────────────────────────────────────┘
  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Shadow (elevation)
```

### Alert Banner
```
┌────────────────────────────────────┐
│  ✅ Success! Your changes saved.   │
└────────────────────────────────────┘
  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  Green background (10% opacity)
```

### Module Card (Hover)
```
Default:
┌────────────────────┐
│  🍎 Nutrition     │
│  Makro-Tracker    │
└────────────────────┘

Hover:
╔════════════════════╗  ← Border changes to accent
║  🍎 Nutrition     ║
║  Makro-Tracker    ║  ← Lifts up (translateY)
╚════════════════════╝
   ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  Shadow increases
```

---

## 📚 References

- WCAG 2.1 AA/AAA Guidelines
- Material Design 3 Color System
- Apple Human Interface Guidelines
- Tailwind CSS Design Tokens
- Notion Design System
- Linear Design System

---

**Created:** October 21, 2025  
**Version:** 1.0  
**Author:** AIO Hub Development Team
