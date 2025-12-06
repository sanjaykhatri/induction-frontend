'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../providers';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    company: '',
    vantage_card_number: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData);
      router.push('/inductions');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      // Auto login after registration
      await login({ email: registerData.email, password: registerData.password });
      router.push('/inductions');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-secondary px-4">
      <div className="max-w-md w-full bg-background p-8 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <div className="logo-placeholder mx-auto mb-4">LOGO</div>
          <h1 className="text-3xl font-bold text-foreground">HSE Induction Training</h1>
          <p className="text-foreground-secondary mt-2">
            {isRegister ? 'Create your account' : 'Please sign in to continue'}
          </p>
        </div>

        {!isRegister ? (
          <form onSubmit={handleLogin} className="space-y-4">
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
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className="text-sm text-primary hover:text-primary-dark"
              >
                Don't have an account? Register
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="reg_name" className="block text-sm font-medium text-foreground mb-1">
                Full Name *
              </label>
              <input
                type="text"
                id="reg_name"
                required
                value={registerData.name}
                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                className="w-full px-4 py-2 border border-theme rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="reg_email" className="block text-sm font-medium text-foreground mb-1">
                Email Address *
              </label>
              <input
                type="email"
                id="reg_email"
                required
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                className="w-full px-4 py-2 border border-theme rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="reg_password" className="block text-sm font-medium text-foreground mb-1">
                Password *
              </label>
              <input
                type="password"
                id="reg_password"
                required
                minLength={8}
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                className="w-full px-4 py-2 border border-theme rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="reg_password_confirmation" className="block text-sm font-medium text-foreground mb-1">
                Confirm Password *
              </label>
              <input
                type="password"
                id="reg_password_confirmation"
                required
                value={registerData.password_confirmation}
                onChange={(e) => setRegisterData({ ...registerData, password_confirmation: e.target.value })}
                className="w-full px-4 py-2 border border-theme rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="reg_company" className="block text-sm font-medium text-foreground mb-1">
                Company
              </label>
              <input
                type="text"
                id="reg_company"
                value={registerData.company}
                onChange={(e) => setRegisterData({ ...registerData, company: e.target.value })}
                className="w-full px-4 py-2 border border-theme rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="reg_vantage" className="block text-sm font-medium text-foreground mb-1">
                Vantage Card Number
              </label>
              <input
                type="text"
                id="reg_vantage"
                value={registerData.vantage_card_number}
                onChange={(e) => setRegisterData({ ...registerData, vantage_card_number: e.target.value })}
                className="w-full px-4 py-2 border border-theme rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="text-sm text-primary hover:text-primary-dark"
              >
                Already have an account? Sign In
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-foreground-secondary">
            Admin?{' '}
            <a href="/admin/login" className="text-primary hover:text-primary-dark font-medium">
              Go to admin login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
