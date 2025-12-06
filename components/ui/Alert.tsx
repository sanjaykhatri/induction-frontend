'use client';

import { ReactNode, HTMLAttributes } from 'react';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  children: ReactNode;
  onClose?: () => void;
}

const variantClasses = {
  info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200',
  success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-200',
  danger: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200',
};

const icons = {
  info: 'ℹ️',
  success: '✓',
  warning: '⚠️',
  danger: '✗',
};

export default function Alert({
  variant = 'info',
  title,
  children,
  onClose,
  className = '',
  ...props
}: AlertProps) {
  return (
    <div
      className={`border rounded-md p-4 ${variantClasses[variant]} ${className}`}
      role="alert"
      {...props}
    >
      <div className="flex items-start">
        <span className="mr-3 text-lg">{icons[variant]}</span>
        <div className="flex-1">
          {title && (
            <h3 className="font-semibold mb-1">{title}</h3>
          )}
          <div>{children}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-3 text-current opacity-70 hover:opacity-100"
            aria-label="Close alert"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

