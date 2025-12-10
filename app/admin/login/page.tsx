'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../providers';
import { Card, Input, Button, Alert } from '@/components/ui';

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
      <Card className="max-w-md w-full" padding="lg">
        <div className="text-center mb-8">
          <div className="logo-placeholder mx-auto mb-4">LOGO</div>
          <h1 className="text-3xl font-bold text-foreground">Admin Login</h1>
          <p className="text-foreground-secondary mt-2">Sign in to access the admin panel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            placeholder="admin@example.com"
          />

          <Input
            label="Password"
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Enter your password"
          />

          <Button type="submit" fullWidth loading={loading}>
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-foreground-secondary">
            Regular user?{' '}
            <Link href="/login" className="text-primary hover:text-primary-dark font-medium">
              Go to user login
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}

