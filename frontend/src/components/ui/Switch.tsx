'use client';
import React, { useId } from 'react';

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className = '', label, id, ...props }, ref) => {
    // Generate an id once per render tree; prefer provided id.
    const generatedId = useId();
    const switchId = id ?? generatedId;
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <button
          type="button"
          role="switch"
          aria-checked={props.checked}
          aria-labelledby={label ? `${switchId}-label` : undefined}
          onClick={(e) => {
            e.preventDefault();
            props.onChange?.({
              ...({} as any),
              target: { checked: !props.checked },
            } as React.ChangeEvent<HTMLInputElement>);
          }}
          className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors duration-150 border`}
          style={{
            backgroundColor: props.checked ? `rgb(var(--accent-600))` : `rgb(var(--bg-elevated))`,
            borderColor: `rgb(var(--card-border))`,
          }}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-150`}
            style={{ transform: props.checked ? 'translateX(18px)' : 'translateX(4px)' }}
          />
        </button>
        {label && (
          <span id={`${switchId}-label`} className="text-sm text-[rgb(var(--fg))]">
            {label}
          </span>
        )}
        {/* Hidden checkbox for form compatibility */}
        <input ref={ref} id={switchId} type="checkbox" className="sr-only" {...props} />
      </div>
    );
  }
);

Switch.displayName = 'Switch';
export default Switch;
