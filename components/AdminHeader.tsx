'use client';

import { useAuth } from '@/app/providers';
import ThemeToggle from './ThemeToggle';
import Link from 'next/link';
import { Button } from './ui';

interface AdminHeaderProps {
  activeTab?: 'dashboard' | 'inductions' | 'submissions' | 'admins';
  navigationItems?: Array<{ href: string; label: string; key?: string; active?: boolean }>;
}

const defaultNavItems = [
  { href: '/admin/dashboard', label: 'Dashboard', key: 'dashboard' },
  { href: '/admin/inductions', label: 'Inductions', key: 'inductions' },
  { href: '/admin/submissions', label: 'Submissions', key: 'submissions' },
  { href: '/admin/admins', label: 'Admins', key: 'admins' },
];

export default function AdminHeader({ activeTab, navigationItems = defaultNavItems }: AdminHeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-background shadow-sm border-b border-theme">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="logo-placeholder">LOGO</div>
            <nav className="flex gap-4">
              {navigationItems.map((item) => {
                const isActive = activeTab === item.key || item.active;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`transition-colors ${
                      isActive
                        ? 'text-primary font-medium'
                        : 'text-foreground-secondary hover:text-foreground'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user && (
              <>
                <div className="text-right hidden sm:block">
                  <p className="font-medium text-foreground">{user.name}</p>
                  <p className="text-sm text-foreground-secondary">{user.email}</p>
                </div>
                <Button variant="outline" size="sm" onClick={logout}>
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

