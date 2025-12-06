'use client';

import { HTMLAttributes } from 'react';

interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

const variantClasses = {
  default: 'bg-primary',
  success: 'bg-green-600',
  warning: 'bg-yellow-600',
  danger: 'bg-red-600',
};

export default function ProgressBar({
  value,
  max = 100,
  showLabel = false,
  size = 'md',
  variant = 'default',
  className = '',
  ...props
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={`w-full ${className}`} {...props}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-foreground-secondary">Progress</span>
          <span className="text-sm font-medium text-foreground">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={`w-full bg-background-secondary rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`${variantClasses[variant]} h-full transition-all duration-300 ease-out rounded-full`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}

