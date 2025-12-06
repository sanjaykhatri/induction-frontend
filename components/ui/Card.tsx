'use client';

import { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'none';
}

const paddingClasses = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  none: '',
};

export default function Card({
  children,
  hover = false,
  padding = 'md',
  className = '',
  ...props
}: CardProps) {
  const baseClasses = 'bg-background rounded-lg shadow-md border border-theme';
  const hoverClass = hover ? 'hover:shadow-lg transition-shadow' : '';
  const paddingClass = paddingClasses[padding];
  
  return (
    <div className={`${baseClasses} ${hoverClass} ${paddingClass} ${className}`} {...props}>
      {children}
    </div>
  );
}

