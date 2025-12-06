'use client';

import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';

interface BaseInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement>, BaseInputProps {
  as?: 'input';
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, BaseInputProps {
  as: 'textarea';
  rows?: number;
}

type InputComponentProps = InputProps | TextareaProps;

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputComponentProps>(
  ({ label, error, helperText, fullWidth = true, className = '', ...props }, ref) => {
    const baseClasses = 'px-4 py-2 border border-theme rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground placeholder:text-foreground-secondary';
    const errorClasses = error ? 'border-red-500 focus:ring-red-500' : '';
    const widthClass = fullWidth ? 'w-full' : '';
    
    const inputClasses = `${baseClasses} ${errorClasses} ${widthClass} ${className}`;
    
    const inputElement = props.as === 'textarea' ? (
      <textarea
        ref={ref as React.Ref<HTMLTextAreaElement>}
        className={inputClasses}
        rows={props.rows || 4}
        {...(props as TextareaProps)}
      />
    ) : (
      <input
        ref={ref as React.Ref<HTMLInputElement>}
        className={inputClasses}
        {...(props as InputProps)}
      />
    );

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className="block text-sm font-medium text-foreground mb-1">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        {inputElement}
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

Input.displayName = 'Input';

export default Input;

