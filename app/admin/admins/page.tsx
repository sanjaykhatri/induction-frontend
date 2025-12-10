'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../providers';
import { adminApi } from '@/lib/api';
import { LoadingSpinner, Button, Badge, Modal, Input, Select, PageContainer, Card } from '@/components/ui';

export default function AdminAdminsPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAdmin, logout } = useAuth();
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin' as 'admin' | 'super_admin',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin/login');
      return;
    }

    if (!authLoading && !isAdmin()) {
      router.push('/inductions');
      return;
    }

    loadAdmins();
  }, [user, authLoading, isAdmin, router]);

  const loadAdmins = async () => {
    try {
      const data = await adminApi.list();
      setAdmins(data);
    } catch (error) {
      console.error('Failed to load admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.create(formData);
      setShowModal(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'admin',
      });
      loadAdmins();
    } catch (error: any) {
      alert(error.message || 'Failed to create admin');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove admin access for this user?')) return;

    try {
      await adminApi.delete(id);
      loadAdmins();
    } catch (error: any) {
      alert(error.message || 'Failed to remove admin');
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
                <Link href="/admin/submissions" className="text-foreground-secondary hover:text-foreground">Submissions</Link>
                <Link href="/admin/admins" className="text-primary font-medium">Admins</Link>
              </nav>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-medium text-foreground">{user?.name}</p>
                  <p className="text-sm text-foreground-secondary">{user?.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm text-foreground-secondary hover:text-foreground border border-gray-300 rounded-md hover:bg-background-secondary transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageContainer
          title="Manage Admins"
          actions={
            <Button onClick={() => setShowModal(true)}>Add Admin</Button>
          }
          maxWidth="full"
        >
          <Card padding="none" className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-background-secondary">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground-secondary uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground-secondary uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground-secondary uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-foreground-secondary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-gray-200">
              {admins.map((admin) => (
                <tr key={admin.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    {admin.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground-secondary">
                    {admin.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={admin.role === 'super_admin' ? 'info' : 'default'}>
                      {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(admin.id)}
                    >
                      Remove Admin
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </Card>
        </PageContainer>

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Add Admin"
          footer={
            <>
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" form="admin-form">Create</Button>
            </>
          }
        >
          <form id="admin-form" onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              label="Email"
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
            <Select
              label="Role"
              required
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'super_admin' })}
              options={[
                { value: 'admin', label: 'Admin' },
                { value: 'super_admin', label: 'Super Admin' }
              ]}
            />
          </form>
        </Modal>
      </main>
    </div>
  );
}

