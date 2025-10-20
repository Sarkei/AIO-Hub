'use client';
import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', ...props }, ref) => (
    <textarea ref={ref} className={`textarea ${className}`} {...props} />
  )
);

Textarea.displayName = 'Textarea';
export default Textarea;
