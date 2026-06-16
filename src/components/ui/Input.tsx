'use client';

import { forwardRef, InputHTMLAttributes, useState } from 'react';
import { Info } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  tooltip?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, tooltip, className = '', id, ...props }, ref) => {
    const [showTip, setShowTip] = useState(false);
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <div className="flex items-center gap-1">
            <label htmlFor={inputId} className="text-sm font-medium text-[var(--fg)]">
              {label}
            </label>
            {tooltip && (
              <div className="relative">
                <button
                  type="button"
                  onMouseEnter={() => setShowTip(true)}
                  onMouseLeave={() => setShowTip(false)}
                  onFocus={() => setShowTip(true)}
                  onBlur={() => setShowTip(false)}
                  className="text-[var(--muted-fg)] hover:text-[var(--fg)]"
                  aria-label="Información"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
                {showTip && (
                  <div className="absolute left-5 top-0 z-10 w-48 p-2 text-xs bg-[var(--fg)] text-[var(--bg)] rounded-lg shadow-[var(--shadow-md)]">
                    {tooltip}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            'w-full h-10 px-3 rounded-lg border text-sm bg-[var(--bg)] text-[var(--fg)] placeholder:text-[var(--muted-fg)]',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-[#e05a5a] focus:border-[#e05a5a]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-[var(--border-color)]',
            className,
          ].join(' ')}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-red-500">{error}</p>
        )}
        {!error && helperText && (
          <p id={`${inputId}-helper`} className="text-xs text-[var(--muted-fg)]">{helperText}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
