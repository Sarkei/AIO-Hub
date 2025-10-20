'use client';
import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {}

const Badge = ({ className = '', ...props }: BadgeProps) => (
  <span className={`badge ${className}`} {...props} />
);

export default Badge;
