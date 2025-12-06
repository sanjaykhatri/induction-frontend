'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../providers';
import { userProgressApi } from '@/lib/api';

export default function ProgressPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [progress, setProgress] = useState<any[]>([]);
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
          <Header showProgress={true} showInductions={true} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">My Progress</h1>

        {progress.length === 0 ? (
          <div className="bg-background rounded-lg shadow-md p-12 text-center">
            <p className="text-foreground-secondary mb-4">You haven't started any inductions yet.</p>
            <a
              href="/inductions"
              className="text-primary hover:text-primary-dark font-medium"
            >
              Browse Available Inductions →
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {progress.map((item) => (
              <div key={item.submission_id} className="bg-background rounded-lg shadow-md p-6">
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
                    <div className="text-sm text-foreground-secondary">
                      Status: <span className="font-medium">{item.status}</span>
                    </div>
                    <div className="text-sm text-foreground-secondary mt-1">
                      {item.progress.completion_percentage}% Complete
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-foreground-secondary">Overall Progress</span>
                    <span className="text-sm text-foreground-secondary">
                      {item.progress.completed_chapters} / {item.progress.total_chapters} chapters
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${item.progress.completion_percentage}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground mb-2">Chapters:</h3>
                  {item.chapters.map((chapter: any, index: number) => (
                    <div
                      key={chapter.id}
                      className={`p-3 rounded border ${
                        chapter.is_completed
                          ? 'bg-green-50 border-green-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
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
                            <button
                              onClick={() => handleContinue(item.submission_id, chapter.id, index)}
                              className="text-xs text-primary hover:text-primary-dark font-medium"
                            >
                              {chapter.progress_percentage > 0 ? 'Continue' : 'Start'}
                            </button>
                          )}
                        </div>
                      </div>
                      {!chapter.is_completed && chapter.progress_percentage > 0 && (
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div
                              className="bg-primary h-1 rounded-full"
                              style={{ width: `${chapter.progress_percentage}%` }}
                            />
                          </div>
                          <p className="text-xs text-foreground-secondary mt-1">
                            {chapter.progress_percentage}% watched
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

