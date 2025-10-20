'use client';
import React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', children, ...props }, ref) => (
    <select ref={ref} className={`select ${className}`} {...props}>
      {children}
    </select>
  )
);

Select.displayName = 'Select';
export default Select;
