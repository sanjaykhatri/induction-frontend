'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../providers';

export default function AdminLoginPage() {
  const router = useRouter();
  const { adminLogin } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await adminLogin(formData);
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-secondary px-4">
      <div className="max-w-md w-full bg-background p-8 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <div className="logo-placeholder mx-auto mb-4">LOGO</div>
          <h1 className="text-3xl font-bold text-foreground">Admin Login</h1>
          <p className="text-foreground-secondary mt-2">Sign in to access the admin panel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-theme rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
              Password *
            </label>
            <input
              type="password"
              id="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border border-theme rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-foreground-secondary">
            Regular user?{' '}
            <a href="/login" className="text-primary hover:text-primary-dark font-medium">
              Go to user login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

