'use client';

import { ReactNode, HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  children: ReactNode;
}

const variantClasses = {
  default: 'bg-background-secondary text-foreground border border-theme',
  success: 'bg-green-100 text-green-800 border border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700',
  warning: 'bg-yellow-100 text-yellow-800 border border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700',
  danger: 'bg-red-100 text-red-800 border border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700',
  info: 'bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700',
};

export default function Badge({
  variant = 'default',
  children,
  className = '',
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

