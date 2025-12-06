'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient, authApi } from '@/lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  company?: string;
  vantage_card_number?: string;
  role: 'user' | 'admin' | 'super_admin';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: {
    email: string;
    password: string;
  }) => Promise<void>;
  adminLogin: (data: {
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Only run on client side to prevent hydration mismatch
    setMounted(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (token) {
      apiClient.setToken(token);
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const userData = await authApi.me();
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: {
    email: string;
    password: string;
  }) => {
    const response = await authApi.login(data);
    apiClient.setToken(response.token);
    setUser(response.user);
  };

  const adminLogin = async (data: {
    email: string;
    password: string;
  }) => {
    const response = await authApi.adminLogin(data);
    apiClient.setToken(response.token);
    setUser(response.user);
  };

  const logout = async () => {
    try {
      // Call logout API to revoke token on server
      await authApi.logout();
    } catch (error) {
      // Even if API call fails, clear local state
      console.error('Logout error:', error);
    } finally {
      // Always clear local token and user state
      apiClient.setToken(null);
      setUser(null);
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  };

  const isAdmin = () => {
    return user?.role === 'admin' || user?.role === 'super_admin';
  };

  return (
    <AuthContext.Provider value={{ user, loading: !mounted || loading, login, adminLogin, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

