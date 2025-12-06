'use client';

import { useTheme } from '@/app/theme-provider';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder to prevent layout shift
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-theme">
        <div className="w-5 h-5"></div>
      </div>
    );
  }

  const themes = [
    { value: 'light' as const, label: 'Light', icon: '☀️' },
    { value: 'dark' as const, label: 'Dark', icon: '🌙' },
    { value: 'system' as const, label: 'System', icon: '💻' },
  ];

  return (
    <div className="relative inline-block">
      <div className="flex items-center gap-1 p-1 bg-background-secondary rounded-lg border border-theme">
        {themes.map((t) => (
          <button
            key={t.value}
            onClick={() => setTheme(t.value)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              theme === t.value
                ? 'bg-primary text-white shadow-sm'
                : 'text-foreground-secondary hover:text-foreground hover:bg-background'
            }`}
            title={`Switch to ${t.label} theme`}
            aria-label={`Switch to ${t.label} theme`}
            aria-pressed={theme === t.value}
          >
            <span className="mr-1.5">{t.icon}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>
      
      {/* Show current resolved theme indicator */}
      {theme === 'system' && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-foreground-secondary whitespace-nowrap">
          Using {resolvedTheme} mode
        </div>
      )}
    </div>
  );
}

