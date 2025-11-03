/**
 * 🎯 TACTICAL DESIGN SYSTEM
 * Zentrale Style-Definitionen für alle Seiten
 * Military/Tech-inspiriertes minimalistisches Design
 */

export const TacticalStyles = {
  // ==================== COLORS ====================
  colors: {
    // Backgrounds
    bg: 'rgb(0, 0, 0)',
    bgBase: 'rgb(12, 12, 12)',
    bgElevated: 'rgb(18, 18, 18)',
    card: 'rgb(18, 18, 18)',
    cardHover: 'rgb(28, 28, 28)',
    cardBorder: 'rgb(38, 38, 38)',
    border: 'rgb(38, 38, 38)',
    
    // Text
    fg: 'rgb(250, 250, 250)',
    fgMuted: 'rgb(160, 160, 160)',
    fgSubtle: 'rgb(100, 100, 100)',
    
    // Accent - Lime/Olive Green (Fitness Focus)
    accent: 'rgb(132, 204, 22)',
    accentHover: 'rgb(101, 163, 13)',
    accentDark: 'rgb(77, 124, 15)',
    accentBg: 'rgba(132, 204, 22, 0.15)',
    
    // Forest Green (Success)
    forest: 'rgb(34, 197, 94)',
    forestBg: 'rgba(34, 197, 94, 0.15)',
    
    // Olive (Alternative)
    olive: 'rgb(113, 128, 0)',
    oliveBg: 'rgba(113, 128, 0, 0.15)',
    
    // Semantic
    success: 'rgb(34, 197, 94)',
    warning: 'rgb(234, 179, 8)',
    danger: 'rgb(239, 68, 68)',
    info: 'rgb(148, 163, 184)',
  },

  // ==================== TYPOGRAPHY ====================
  typography: {
    // Font Families
    fontMono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    fontSans: 'system-ui, -apple-system, sans-serif',
    
    // Headlines
    h1: {
      fontSize: '3rem',
      fontWeight: '900',
      letterSpacing: '-0.02em',
      textTransform: 'uppercase' as const,
    },
    h2: {
      fontSize: '1.875rem',
      fontWeight: '900',
      letterSpacing: '-0.01em',
      textTransform: 'uppercase' as const,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: '800',
      letterSpacing: '0',
    },
    
    // Body
    body: {
      fontSize: '0.875rem',
      fontWeight: '400',
      lineHeight: '1.5',
    },
    bodyMono: {
      fontSize: '0.75rem',
      fontWeight: '500',
      fontFamily: 'ui-monospace, monospace',
      letterSpacing: '0.05em',
      textTransform: 'uppercase' as const,
    },
  },

  // ==================== SPACING ====================
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },

  // ==================== BORDERS ====================
  borders: {
    default: '1px solid rgb(38, 38, 38)',
    subtle: '1px solid rgb(38, 38, 38)',
    accent: '2px solid rgb(132, 204, 22)',
    accentLeft: '4px solid rgb(132, 204, 22)',
    success: '4px solid rgb(34, 197, 94)',
    warning: '4px solid rgb(234, 179, 8)',
    danger: '4px solid rgb(239, 68, 68)',
  },

  // ==================== EFFECTS ====================
  effects: {
    glow: '0 0 20px rgba(132, 204, 22, 0.3)',
    glowSuccess: '0 0 20px rgba(34, 197, 94, 0.3)',
    glowDanger: '0 0 20px rgba(239, 68, 68, 0.3)',
    shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.8)',
    shadowLg: '0 12px 24px -4px rgba(0, 0, 0, 0.95)',
  },

  // ==================== TRANSITIONS ====================
  transitions: {
    fast: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// ==================== HELPER FUNCTIONS ====================
export const TacticalHelpers = {
  /**
   * Marker für Sektionsüberschriften
   */
  getSectionMarker: (color: 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'forest' | 'olive' = 'accent') => ({
    color: TacticalStyles.colors[color] || TacticalStyles.colors[color as 'accent'],
  }),

  /**
   * Stat Card mit farbiger Border
   */
  getStatCard: (borderColor: 'accent' | 'forest' | 'olive' | 'warning' | 'danger' = 'accent') => ({
    backgroundColor: TacticalStyles.colors.card,
    border: TacticalStyles.borders.subtle,
    borderLeft: `4px solid ${TacticalStyles.colors[borderColor]}`,
    borderRadius: '0.5rem',
    transition: TacticalStyles.transitions.base,
  }),

  /**
   * Hover-Effekt für Cards
   */
  getCardHover: () => ({
    backgroundColor: TacticalStyles.colors.cardHover,
    transform: 'scale(1.02)',
    boxShadow: TacticalStyles.effects.shadow,
  }),

  /**
   * Monospace Stats Display
   */
  getStatValue: () => ({
    fontFamily: TacticalStyles.typography.fontMono,
    fontSize: '2.25rem',
    fontWeight: '900',
    color: TacticalStyles.colors.fg,
  }),

  /**
   * Monospace Label
   */
  getStatLabel: () => ({
    fontFamily: TacticalStyles.typography.fontMono,
    fontSize: '0.75rem',
    fontWeight: '500',
    color: TacticalStyles.colors.fgSubtle,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  }),

  /**
   * Tactical Button
   */
  getTacticalButton: (variant: 'primary' | 'secondary' | 'danger' = 'primary') => {
    const variants = {
      primary: {
        backgroundColor: TacticalStyles.colors.accent,
        color: 'rgb(0, 0, 0)',
        border: 'none',
      },
      secondary: {
        backgroundColor: 'transparent',
        color: TacticalStyles.colors.fg,
        border: TacticalStyles.borders.subtle,
      },
      danger: {
        backgroundColor: TacticalStyles.colors.danger,
        color: 'rgb(255, 255, 255)',
        border: 'none',
      },
    };

    return {
      ...variants[variant],
      padding: '0.5rem 1rem',
      borderRadius: '0.375rem',
      fontWeight: '700',
      fontSize: '0.75rem',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      cursor: 'pointer',
      transition: TacticalStyles.transitions.fast,
    };
  },

  /**
   * Progress Bar
   */
  getProgressBar: (progress: number, color: 'accent' | 'forest' | 'warning' = 'accent') => ({
    container: {
      height: '0.25rem',
      backgroundColor: TacticalStyles.colors.cardBorder,
      borderRadius: '9999px',
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      width: `${Math.min(progress, 100)}%`,
      backgroundColor: TacticalStyles.colors[color],
      boxShadow: color === 'accent' ? TacticalStyles.effects.glow : TacticalStyles.effects.glowSuccess,
      transition: TacticalStyles.transitions.base,
    },
  }),

  /**
   * Empty State Container
   */
  getEmptyState: () => ({
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
    textAlign: 'center' as const,
  }),

  /**
   * Modal Overlay
   */
  getModalOverlay: () => ({
    position: 'fixed' as const,
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    padding: '1rem',
  }),

  /**
   * Modal Content
   */
  getModalContent: () => ({
    backgroundColor: TacticalStyles.colors.card,
    border: TacticalStyles.borders.subtle,
    borderRadius: '0.75rem',
    padding: '1.5rem',
    maxWidth: '32rem',
    width: '100%',
    boxShadow: TacticalStyles.effects.shadowLg,
  }),

  /**
   * Label Styles für Formulare
   */
  getLabelStyles: () => ({
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '700',
    color: TacticalStyles.colors.fg,
    marginBottom: '0.5rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  }),

  /**
   * Input/Select/Textarea Styles
   */
  getInputStyles: () => ({
    width: '100%',
    padding: '0.75rem',
    backgroundColor: TacticalStyles.colors.card,
    border: TacticalStyles.borders.subtle,
    borderRadius: '0.375rem',
    color: TacticalStyles.colors.fg,
    fontSize: '1rem',
    transition: TacticalStyles.transitions.fast,
    outline: 'none',
  }),

  /**
   * Table Header Styles
   */
  getTableHeader: () => ({
    padding: '1rem',
    textAlign: 'left' as const,
    fontSize: '0.75rem',
    fontWeight: '700',
    color: TacticalStyles.colors.accent,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    borderBottom: TacticalStyles.borders.subtle,
  }),

  /**
   * Table Cell Styles
   */
  getTableCell: () => ({
    padding: '1rem',
    fontSize: '0.875rem',
    color: TacticalStyles.colors.fg,
    borderBottom: TacticalStyles.borders.subtle,
  }),
};

export default { TacticalStyles, TacticalHelpers };
