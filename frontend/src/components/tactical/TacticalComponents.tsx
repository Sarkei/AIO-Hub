/**
 * 🎯 TACTICAL UI COMPONENTS
 * Wiederverwendbare UI-Komponenten im Tactical Style
 */

import React from 'react';
import { TacticalStyles, TacticalHelpers } from './TacticalStyles';

// ==================== PAGE HEADER ====================
interface TacticalHeaderProps {
  title: string;
  subtitle?: string;
  status?: string;
  actions?: React.ReactNode;
  date?: Date;
}

export const TacticalHeader: React.FC<TacticalHeaderProps> = ({
  title,
  subtitle,
  status = 'OPERATIONAL',
  actions,
  date = new Date(),
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1
            style={{
              ...TacticalStyles.typography.h1,
              color: TacticalStyles.colors.fg,
              textShadow: TacticalStyles.effects.glow,
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              style={{
                ...TacticalStyles.typography.bodyMono,
                color: TacticalStyles.colors.accent,
                marginTop: '0.5rem',
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          {actions}
          <div className="text-right">
            <div
              style={{
                fontSize: '1.875rem',
                fontWeight: '900',
                color: TacticalStyles.colors.accent,
              }}
            >
              {date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
            </div>
            <div
              style={{
                ...TacticalStyles.typography.bodyMono,
                color: TacticalStyles.colors.fgMuted,
              }}
            >
              {date.toLocaleDateString('de-DE', { weekday: 'long' }).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== SECTION HEADER ====================
interface TacticalSectionProps {
  title: string;
  markerColor?: 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'forest' | 'olive';
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export const TacticalSection: React.FC<TacticalSectionProps> = ({
  title,
  markerColor = 'accent',
  actions,
  children,
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2
          style={{
            ...TacticalStyles.typography.h2,
            color: TacticalStyles.colors.fg,
          }}
        >
          <span style={TacticalHelpers.getSectionMarker(markerColor)}>█</span> {title}
        </h2>
        {actions}
      </div>
      {children}
    </div>
  );
};

// ==================== STAT CARD ====================
interface TacticalStatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  borderColor?: 'accent' | 'forest' | 'olive' | 'warning' | 'danger';
  progress?: number;
  onClick?: () => void;
}

export const TacticalStatCard: React.FC<TacticalStatCardProps> = ({
  label,
  value,
  unit,
  subtitle,
  borderColor = 'accent',
  progress,
  onClick,
}) => {
  const cardStyle = TacticalHelpers.getStatCard(borderColor);
  const progressStyles = progress !== undefined ? TacticalHelpers.getProgressBar(progress, borderColor === 'forest' ? 'forest' : borderColor === 'warning' ? 'warning' : 'accent') : null;

  return (
    <div
      style={{
        ...cardStyle,
        padding: '1.5rem',
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
      className="transition-all hover:scale-[1.02]"
    >
      <div style={TacticalHelpers.getStatLabel()}>{label}</div>
      <div className="flex items-baseline gap-2 mt-2">
        <span style={TacticalHelpers.getStatValue()}>{value}</span>
        {unit && (
          <span
            style={{
              fontSize: '1.125rem',
              fontWeight: '700',
              color: TacticalStyles.colors.fgMuted,
            }}
          >
            {unit}
          </span>
        )}
      </div>
      {subtitle && (
        <div
          className="mt-2"
          style={{
            fontSize: '0.875rem',
            color: TacticalStyles.colors.fgSubtle,
          }}
        >
          {subtitle}
        </div>
      )}
      {progressStyles && (
        <div className="mt-3">
          <div style={progressStyles.container}>
            <div style={progressStyles.fill} />
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== EMPTY STATE ====================
interface TacticalEmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const TacticalEmptyState: React.FC<TacticalEmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div style={TacticalHelpers.getEmptyState()}>
      <div
        style={{
          fontSize: '6rem',
          marginBottom: '1rem',
          opacity: 0.5,
        }}
      >
        {icon}
      </div>
      <h3
        style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: TacticalStyles.colors.fg,
          marginBottom: '0.5rem',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: '0.875rem',
          color: TacticalStyles.colors.fgMuted,
          marginBottom: '1.5rem',
          maxWidth: '28rem',
        }}
      >
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          style={TacticalHelpers.getTacticalButton('primary')}
          onClick={onAction}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = TacticalStyles.colors.accentHover;
            e.currentTarget.style.boxShadow = TacticalStyles.effects.glow;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = TacticalStyles.colors.accent;
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

// ==================== TACTICAL BUTTON ====================
interface TacticalButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  fullWidth?: boolean;
}

export const TacticalButton: React.FC<TacticalButtonProps> = ({
  children,
  variant = 'primary',
  onClick,
  type = 'button',
  disabled = false,
  fullWidth = false,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...TacticalHelpers.getTacticalButton(variant),
        width: fullWidth ? '100%' : 'auto',
        opacity: disabled ? 0.5 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          if (variant === 'primary') {
            e.currentTarget.style.backgroundColor = TacticalStyles.colors.accentHover;
            e.currentTarget.style.boxShadow = TacticalStyles.effects.glow;
          } else if (variant === 'secondary') {
            e.currentTarget.style.backgroundColor = TacticalStyles.colors.cardHover;
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          if (variant === 'primary') {
            e.currentTarget.style.backgroundColor = TacticalStyles.colors.accent;
            e.currentTarget.style.boxShadow = 'none';
          } else if (variant === 'secondary') {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }
      }}
    >
      {children}
    </button>
  );
};

// ==================== ACTION CARD ====================
interface TacticalActionCardProps {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
}

export const TacticalActionCard: React.FC<TacticalActionCardProps> = ({
  icon,
  title,
  description,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: TacticalStyles.colors.card,
        border: TacticalStyles.borders.subtle,
        borderRadius: '0.5rem',
        padding: '1.5rem',
        cursor: 'pointer',
        transition: TacticalStyles.transitions.base,
      }}
      className="hover:scale-[1.02]"
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = TacticalStyles.colors.cardHover;
        e.currentTarget.style.boxShadow = TacticalStyles.effects.shadow;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = TacticalStyles.colors.card;
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div className="flex items-center gap-4">
        <div
          style={{
            width: '3rem',
            height: '3rem',
            borderRadius: '0.5rem',
            backgroundColor: TacticalStyles.colors.accentBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
          }}
        >
          {icon}
        </div>
        <div>
          <div
            style={{
              fontWeight: '700',
              marginBottom: '0.25rem',
              color: TacticalStyles.colors.fg,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: '0.75rem',
              color: TacticalStyles.colors.fgSubtle,
            }}
          >
            {description}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== MODAL ====================
interface TacticalModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const TacticalModal: React.FC<TacticalModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div style={TacticalHelpers.getModalOverlay()} onClick={onClose}>
      <div style={TacticalHelpers.getModalContent()} onClick={(e) => e.stopPropagation()}>
        <h2
          style={{
            ...TacticalStyles.typography.h3,
            color: TacticalStyles.colors.fg,
            marginBottom: '1.5rem',
          }}
        >
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
};
