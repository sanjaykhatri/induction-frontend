'use client';

import { ReactNode, HTMLAttributes } from 'react';
import Button from './Button';

interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  };
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
  ...props
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`} {...props}>
      {icon && <div className="mb-4 text-6xl">{icon}</div>}
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-foreground-secondary mb-6 max-w-md mx-auto">{description}</p>
      )}
      {action && (
        <Button variant={action.variant || 'primary'} onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

