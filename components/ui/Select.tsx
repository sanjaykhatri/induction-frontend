'use client';

import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  fullWidth?: boolean;
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, fullWidth = true, placeholder, className = '', ...props }, ref) => {
    const baseClasses = 'px-4 py-2 border border-theme rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground';
    const errorClasses = error ? 'border-red-500 focus:ring-red-500' : '';
    const widthClass = fullWidth ? 'w-full' : '';
    
    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className="block text-sm font-medium text-foreground mb-1">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={`${baseClasses} ${errorClasses} ${widthClass} ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-xs text-foreground-secondary">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;

