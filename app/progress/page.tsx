'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../providers';
import { userProgressApi } from '@/lib/api';
import Header from '@/components/Header';
import { LoadingSpinner, Card, Button, Badge, ProgressBar, EmptyState, PageContainer } from '@/components/ui';

export default function ProgressPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [progress, setProgress] = useState<Array<{
    submission_id: number;
    induction: { title: string; description?: string };
    status: string;
    progress: { completion_percentage: number; completed_chapters: number; total_chapters: number };
    chapters: Array<{
      id: number;
      title: string;
      is_completed: boolean;
      completed_at?: string;
      progress_percentage: number;
    }>;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && (user.role === 'admin' || user.role === 'super_admin')) {
      router.push('/admin/dashboard');
      return;
    }

    loadProgress();
  }, [user, authLoading, router]);

  const loadProgress = async () => {
    try {
      const data = await userProgressApi.getAll();
      setProgress(data);
    } catch (error) {
      console.error('Failed to load progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = (submissionId: number, chapterId: number, chapterIndex: number) => {
    router.push(`/inductions/${submissionId}/chapter/${chapterIndex + 1}`);
  };

  if (authLoading || loading) {
    return <LoadingSpinner fullScreen text="Loading..." />;
  }

  return (
    <div className="min-h-screen bg-background-secondary">
      <Header showProgress={true} showInductions={true} />

      <PageContainer title="My Progress" maxWidth="full">
        {progress.length === 0 ? (
          <EmptyState
            title="No Inductions Started"
            description="You haven't started any inductions yet."
            action={{
              label: 'Browse Available Inductions',
              onClick: () => router.push('/inductions'),
              variant: 'primary'
            }}
          />
        ) : (
          <div className="space-y-6">
            {progress.map((item) => (
              <Card key={item.submission_id}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">
                      {item.induction.title}
                    </h2>
                    {item.induction.description && (
                      <p className="text-foreground-secondary mt-1">
                        {item.induction.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-foreground-secondary mb-1">
                      Status: <Badge variant={item.status === 'completed' ? 'success' : 'warning'}>{item.status}</Badge>
                    </div>
                    <div className="text-sm text-foreground-secondary mt-1">
                      {item.progress.completion_percentage}% Complete
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <ProgressBar
                    value={item.progress.completion_percentage}
                    showLabel
                    variant={item.progress.completion_percentage === 100 ? 'success' : 'default'}
                  />
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-foreground-secondary">Overall Progress</span>
                    <span className="text-sm text-foreground-secondary">
                      {item.progress.completed_chapters} / {item.progress.total_chapters} chapters
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground mb-2">Chapters:</h3>
                  {item.chapters.map((chapter, index: number) => (
                    <Card
                      key={chapter.id}
                      className={chapter.is_completed ? 'bg-green-50 border-green-200' : ''}
                      padding="sm"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {chapter.is_completed ? (
                            <span className="text-green-600 font-bold">✓</span>
                          ) : (
                            <span className="text-gray-400">○</span>
                          )}
                          <span className="text-sm font-medium text-foreground">
                            {index + 1}. {chapter.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          {chapter.is_completed ? (
                            <span className="text-xs text-green-600">
                              Completed {chapter.completed_at 
                                ? new Date(chapter.completed_at).toLocaleDateString()
                                : ''}
                            </span>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleContinue(item.submission_id, chapter.id, index)}
                            >
                              {chapter.progress_percentage > 0 ? 'Continue' : 'Start'}
                            </Button>
                          )}
                        </div>
                      </div>
                      {!chapter.is_completed && chapter.progress_percentage > 0 && (
                        <div className="mt-2">
                          <ProgressBar
                            value={chapter.progress_percentage}
                            size="sm"
                            showLabel
                          />
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </PageContainer>
    </div>
  );
}

