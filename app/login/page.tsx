'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../providers';
import { Card, Input, Button, Alert } from '@/components/ui';

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
      <Card className="max-w-md w-full" padding="lg">
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
              <Alert variant="danger" title="Error">
                {error}
              </Alert>
            )}

            <Input
              label="Email Address"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <Input
              label="Password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />

            <Button type="submit" fullWidth loading={loading}>
              Sign In
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsRegister(true)}
              >
                Don't have an account? Register
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <Alert variant="danger" title="Error">
                {error}
              </Alert>
            )}

            <Input
              label="Full Name"
              type="text"
              required
              value={registerData.name}
              onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
            />

            <Input
              label="Email Address"
              type="email"
              required
              value={registerData.email}
              onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
            />

            <Input
              label="Password"
              type="password"
              required
              minLength={8}
              value={registerData.password}
              onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
              helperText="Must be at least 8 characters"
            />

            <Input
              label="Confirm Password"
              type="password"
              required
              value={registerData.password_confirmation}
              onChange={(e) => setRegisterData({ ...registerData, password_confirmation: e.target.value })}
            />

            <Input
              label="Company"
              type="text"
              value={registerData.company}
              onChange={(e) => setRegisterData({ ...registerData, company: e.target.value })}
            />

            <Input
              label="Vantage Card Number"
              type="text"
              value={registerData.vantage_card_number}
              onChange={(e) => setRegisterData({ ...registerData, vantage_card_number: e.target.value })}
            />

            <Button type="submit" fullWidth loading={loading}>
              Register
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsRegister(false)}
              >
                Already have an account? Sign In
              </Button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-foreground-secondary">
            Admin?{' '}
            <Link href="/admin/login" className="text-primary hover:text-primary-dark font-medium">
              Go to admin login
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
