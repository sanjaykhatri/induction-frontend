'use client';

import { ReactNode, HTMLAttributes } from 'react';

interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  title?: string;
  description?: string;
  actions?: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const maxWidthClasses = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full',
};

export default function PageContainer({
  children,
  title,
  description,
  actions,
  maxWidth = 'xl',
  className = '',
  ...props
}: PageContainerProps) {
  return (
    <div className={`min-h-screen bg-background-secondary ${className}`} {...props}>
      <main className={`${maxWidthClasses[maxWidth]} mx-auto px-4 sm:px-6 lg:px-8 py-8`}>
        {(title || description || actions) && (
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                {title && (
                  <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
                )}
                {description && (
                  <p className="text-foreground-secondary">{description}</p>
                )}
              </div>
              {actions && <div className="flex items-center gap-3">{actions}</div>}
            </div>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}

