'use client';

import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

function variantClass(variant: ButtonVariant) {
  switch (variant) {
    case 'primary':
      return 'btn btn-primary';
    case 'secondary':
      return 'btn btn-secondary';
    case 'danger':
      return 'btn btn-danger';
    case 'ghost':
      return 'btn';
    default:
      return 'btn';
  }
}

function sizeClass(size: ButtonSize) {
  switch (size) {
    case 'sm':
      return 'px-3 py-1.5 text-sm';
    case 'lg':
      return 'px-5 py-3 text-base';
    case 'md':
    default:
      return 'px-4 py-2 text-sm';
  }
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', ...props }, ref) => {
    const cls = `${variantClass(variant)} ${sizeClass(size)} ${className}`.trim();
    return <button ref={ref} className={cls} {...props} />;
  }
);

Button.displayName = 'Button';

export default Button;
