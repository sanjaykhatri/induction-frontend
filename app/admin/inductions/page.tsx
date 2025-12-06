'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../providers';
import { adminInductionApi } from '@/lib/api';

export default function AdminInductionsPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAdmin, logout } = useAuth();
  const [inductions, setInductions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingInduction, setEditingInduction] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    is_active: true,
    display_order: 0,
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

    loadInductions();
  }, [user, authLoading, isAdmin, router]);

  const loadInductions = async () => {
    try {
      const data = await adminInductionApi.list();
      setInductions(data);
    } catch (error) {
      console.error('Failed to load inductions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingInduction(null);
    setFormData({
      title: '',
      description: '',
      is_active: true,
      display_order: 0,
    });
    setShowModal(true);
  };

  const handleEdit = (induction: any) => {
    setEditingInduction(induction);
    setFormData({
      title: induction.title,
      description: induction.description || '',
      is_active: induction.is_active,
      display_order: induction.display_order,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingInduction) {
        await adminInductionApi.update(editingInduction.id, formData);
      } else {
        await adminInductionApi.create(formData);
      }
      setShowModal(false);
      loadInductions();
    } catch (error: any) {
      alert(error.message || 'Failed to save induction');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this induction?')) return;

    try {
      await adminInductionApi.delete(id);
      loadInductions();
    } catch (error: any) {
      alert(error.message || 'Failed to delete induction');
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
      <header className="bg-background shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="logo-placeholder">LOGO</div>
            <div className="flex items-center gap-4">
              <nav className="flex gap-4">
                <a href="/admin/dashboard" className="text-foreground-secondary hover:text-foreground">Dashboard</a>
                <a href="/admin/inductions" className="text-primary font-medium">Inductions</a>
                <a href="/admin/submissions" className="text-foreground-secondary hover:text-foreground">Submissions</a>
                <a href="/admin/admins" className="text-foreground-secondary hover:text-foreground">Admins</a>
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Manage Inductions</h1>
          <button
            onClick={handleCreate}
            className="bg-primary text-white py-2 px-6 rounded-md hover:bg-primary-dark transition-colors"
          >
            New Induction
          </button>
        </div>

        <div className="bg-background rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-background-secondary">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground-secondary uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground-secondary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground-secondary uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-foreground-secondary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-gray-200">
              {inductions.map((induction) => (
                <tr key={induction.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-foreground">{induction.title}</div>
                    {induction.description && (
                      <div className="text-sm text-foreground-secondary">{induction.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        induction.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {induction.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground-secondary">
                    {induction.display_order}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a
                      href={`/admin/inductions/${induction.id}`}
                      className="text-primary hover:text-primary-dark mr-4"
                    >
                      Manage
                    </a>
                    <button
                      onClick={() => handleEdit(induction)}
                      className="text-primary hover:text-primary-dark mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(induction.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {editingInduction ? 'Edit Induction' : 'New Induction'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-foreground">Active</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

