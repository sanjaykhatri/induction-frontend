'use client';

import { HTMLAttributes } from 'react';

interface LoadingSpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'h-6 w-6 border-2',
  md: 'h-12 w-12 border-b-2',
  lg: 'h-16 w-16 border-b-2',
};

export default function LoadingSpinner({
  size = 'md',
  text,
  fullScreen = false,
  className = '',
  ...props
}: LoadingSpinnerProps) {
  const spinner = (
    <div className={`flex flex-col items-center justify-center ${className}`} {...props}>
      <div
        className={`animate-spin rounded-full border-primary ${sizeClasses[size]}`}
        role="status"
        aria-label="Loading"
      />
      {text && (
        <p className="mt-4 text-foreground-secondary">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background-secondary/80 backdrop-blur-sm z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}

