'use client';

import { useAuth } from '@/app/providers';
import ThemeToggle from './ThemeToggle';
import { Button } from './ui';

interface HeaderProps {
  showProgress?: boolean;
  showInductions?: boolean;
  navigationItems?: Array<{ href: string; label: string }>;
  showUserInfo?: boolean;
  showLogout?: boolean;
}

export default function Header({
  showProgress = false,
  showInductions = false,
  navigationItems = [],
  showUserInfo = true,
  showLogout = true,
}: HeaderProps) {
  const { user, logout } = useAuth();

  const defaultNavItems = [
    ...(showInductions ? [{ href: '/inductions', label: 'Inductions' }] : []),
    ...(showProgress ? [{ href: '/progress', label: 'My Progress' }] : []),
    ...navigationItems,
  ];

  return (
    <header className="bg-background shadow-sm border-b border-theme">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="logo-placeholder">LOGO</div>
            {defaultNavItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-foreground-secondary hover:text-foreground transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user && showUserInfo && (
              <>
                <div className="text-right hidden sm:block">
                  <p className="font-medium text-foreground">{user.name}</p>
                  <p className="text-sm text-foreground-secondary">{user.email}</p>
                </div>
                {showLogout && (
                  <Button variant="outline" size="sm" onClick={logout}>
                    Logout
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

