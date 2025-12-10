'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../providers';
import { adminSubmissionApi } from '@/lib/api';
import { LoadingSpinner, Button, Badge, PageContainer, Card } from '@/components/ui';

export default function AdminSubmissionsPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAdmin, logout } = useAuth();
  const [submissions, setSubmissions] = useState<any[]>([]);
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

    loadSubmissions();
  }, [user, authLoading, isAdmin, router]);

  const loadSubmissions = async () => {
    try {
      const data = await adminSubmissionApi.list({});
      setSubmissions(data.data || data);
    } catch (error) {
      console.error('Failed to load submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return <LoadingSpinner fullScreen text="Loading..." />;
  }

  return (
    <div className="min-h-screen bg-background-secondary">
      <header className="bg-background shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="logo-placeholder">LOGO</div>
            <div className="flex items-center gap-4">
              <nav className="flex gap-4">
                <Link href="/admin/dashboard" className="text-foreground-secondary hover:text-foreground">Dashboard</Link>
                <Link href="/admin/inductions" className="text-foreground-secondary hover:text-foreground">Inductions</Link>
                <Link href="/admin/submissions" className="text-primary font-medium">Submissions</Link>
                <Link href="/admin/admins" className="text-foreground-secondary hover:text-foreground">Admins</Link>
              </nav>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-medium text-foreground">{user?.name}</p>
                  <p className="text-sm text-foreground-secondary">{user?.email}</p>
                </div>
                <Button variant="outline" size="sm" onClick={logout}>
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageContainer title="Submissions" maxWidth="full">
          <Card padding="none" className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-background-secondary">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground-secondary uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground-secondary uppercase tracking-wider">
                  Induction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground-secondary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground-secondary uppercase tracking-wider">
                  Completed At
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-foreground-secondary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-gray-200">
              {submissions.map((submission) => (
                <tr key={submission.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-foreground">
                      {submission.user?.name || 'N/A'}
                    </div>
                    <div className="text-sm text-foreground-secondary">
                      {submission.user?.email || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-foreground">
                      {submission.induction?.title || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      variant={
                        submission.status === 'completed'
                          ? 'success'
                          : submission.status === 'pending'
                          ? 'warning'
                          : 'info'
                      }
                    >
                      {submission.status === 'completed' 
                        ? 'Completed' 
                        : submission.status === 'pending'
                        ? 'Pending'
                        : 'In Progress'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground-secondary">
                    {submission.completed_at
                      ? new Date(submission.completed_at).toLocaleString()
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/admin/submissions/${submission.id}`}>
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </Card>
        </PageContainer>
      </main>
    </div>
  );
}

