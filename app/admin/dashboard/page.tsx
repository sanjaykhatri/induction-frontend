'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../providers';
import { adminSubmissionApi } from '@/lib/api';
import AdminHeader from '@/components/AdminHeader';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    completedSubmissions: 0,
    inProgressSubmissions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin/login');
      return;
    }

    if (!authLoading && !isAdmin()) {
      router.push('/inductions');
      return;
    }

    loadStats();
  }, [user, authLoading, isAdmin, router]);

  const loadStats = async () => {
    try {
      const allSubmissions = await adminSubmissionApi.list({});
      const completed = await adminSubmissionApi.list({ status: 'completed' });
      const inProgress = await adminSubmissionApi.list({ status: 'in_progress' });

      setStats({
        totalSubmissions: allSubmissions.data?.length || 0,
        completedSubmissions: completed.data?.length || 0,
        inProgressSubmissions: inProgress.data?.length || 0,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-foreground-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-secondary">
      <AdminHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-background rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-foreground-secondary mb-2">Total Submissions</h3>
            <p className="text-3xl font-bold text-foreground">{stats.totalSubmissions}</p>
          </div>

          <div className="bg-background rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-foreground-secondary mb-2">Completed</h3>
            <p className="text-3xl font-bold text-green-600">{stats.completedSubmissions}</p>
          </div>

          <div className="bg-background rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-foreground-secondary mb-2">In Progress</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats.inProgressSubmissions}</p>
          </div>
        </div>

        <div className="mt-8">
          <Link
            href="/admin/inductions"
            className="inline-block bg-primary text-white py-2 px-6 rounded-md hover:bg-primary-dark transition-colors"
          >
            Manage Inductions
          </Link>
        </div>
      </main>
    </div>
  );
}

