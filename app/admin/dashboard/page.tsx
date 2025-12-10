'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../providers';
import { adminSubmissionApi } from '@/lib/api';
import AdminHeader from '@/components/AdminHeader';
import { LoadingSpinner, Card, Button, PageContainer } from '@/components/ui';

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
    return <LoadingSpinner fullScreen text="Loading..." />;
  }

  return (
    <div className="min-h-screen bg-background-secondary">
      <AdminHeader />

      <PageContainer
        title="Admin Dashboard"
        maxWidth="full"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-foreground-secondary mb-2">Total Submissions</h3>
            <p className="text-3xl font-bold text-foreground">{stats.totalSubmissions}</p>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-foreground-secondary mb-2">Completed</h3>
            <p className="text-3xl font-bold text-green-600">{stats.completedSubmissions}</p>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-foreground-secondary mb-2">In Progress</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats.inProgressSubmissions}</p>
          </Card>
        </div>

        <div className="mt-8">
          <Link href="/admin/inductions">
            <Button>Manage Inductions</Button>
          </Link>
        </div>
      </PageContainer>
    </div>
  );
}

