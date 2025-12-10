'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../providers';
import { adminInductionApi } from '@/lib/api';
import { LoadingSpinner, Button, Badge, Modal, Input, PageContainer, Card } from '@/components/ui';

export default function AdminInductionsPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAdmin, logout } = useAuth();
  const [inductions, setInductions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingInduction, setEditingInduction] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    is_active: true,
    display_order: 0,
  });
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

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

  const handleImport = async () => {
    if (!importFile) return;
    setImporting(true);
    try {
      await adminInductionApi.importCsv(importFile);
      setShowImportModal(false);
      setImportFile(null);
      loadInductions();
    } catch (error: any) {
      alert(error.message || 'Failed to import CSV');
    } finally {
      setImporting(false);
    }
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
    return <LoadingSpinner fullScreen text="Loading..." />;
  }

  return (
    <>
    <div className="min-h-screen bg-background-secondary">
      <header className="bg-background shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="logo-placeholder">LOGO</div>
            <div className="flex items-center gap-4">
              <nav className="flex gap-4">
                <Link href="/admin/dashboard" className="text-foreground-secondary hover:text-foreground">Dashboard</Link>
                <Link href="/admin/inductions" className="text-primary font-medium">Inductions</Link>
                <Link href="/admin/submissions" className="text-foreground-secondary hover:text-foreground">Submissions</Link>
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
        <PageContainer
          title="Manage Inductions"
          actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowImportModal(true)}>Import CSV</Button>
            <Button onClick={handleCreate}>New Induction</Button>
          </div>
          }
          maxWidth="full"
        >
          <Card padding="none" className="overflow-hidden">
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
                    <Badge variant={induction.is_active ? 'success' : 'default'}>
                      {induction.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground-secondary">
                    {induction.display_order}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/inductions/${induction.id}`}>
                        <Button variant="outline" size="sm">Manage</Button>
                      </Link>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(induction)}>
                        Edit
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(induction.id)}>
                        Delete
                      </Button>
                    </div>
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
          title={editingInduction ? 'Edit Induction' : 'New Induction'}
          footer={
            <>
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" form="induction-form">Save</Button>
            </>
          }
        >
          <form id="induction-form" onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Title"
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <Input
              label="Description"
              as="textarea"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="is_active" className="text-sm text-foreground">Active</label>
            </div>
            <Input
              label="Display Order"
              type="number"
              value={formData.display_order}
              onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
            />
          </form>
        </Modal>
      </main>
    </div>

    <Modal
      isOpen={showImportModal}
      onClose={() => {
        setShowImportModal(false);
        setImportFile(null);
      }}
      title="Import Induction from CSV"
      footer={
        <>
          <Button variant="outline" onClick={() => {
            setShowImportModal(false);
            setImportFile(null);
          }}>Cancel</Button>
          <Button onClick={handleImport} loading={importing} disabled={!importFile}>
            Import
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <Input
          type="file"
          accept=".csv,text/csv"
          label="CSV File"
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            setImportFile(file);
          }}
        />
        <p className="text-sm text-foreground-secondary">
          Expected columns: induction_title, induction_description, induction_is_active, induction_display_order,
          chapter_title, chapter_description, chapter_video_url, chapter_display_order, pass_percentage,
          question_text, question_type (text|single_choice|multi_choice), question_options (pipe separated or JSON),
          question_correct_answer (pipe separated), question_display_order.
        </p>
      </div>
    </Modal>
    </>
  );
}

