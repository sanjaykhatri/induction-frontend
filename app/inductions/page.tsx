'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../providers';
import { inductionApi, userProgressApi } from '@/lib/api';
import Header from '@/components/Header';
import { Card, Button, Alert, EmptyState, LoadingSpinner, PageContainer } from '@/components/ui';

export default function InductionsPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [inductions, setInductions] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<Record<number, any>>({});
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

    loadInductions();
  }, [user, authLoading, router]);

  const checkForNewChapters = async (inductionId: number, submission: any) => {
    try {
      // Check if there are new chapters by calling the start endpoint
      // This will update the submission if new chapters exist
      const response = await inductionApi.start(inductionId);
      return response.has_new_chapters || false;
    } catch (error) {
      console.error('Failed to check for new chapters:', error);
      return false;
    }
  };

  const loadInductions = async () => {
    try {
      const data = await inductionApi.getActive();
      setInductions(data);
      
      // Load user's submissions to check completion status
      try {
        const progressData = await userProgressApi.getAll();
        const submissionsMap: Record<number, any> = {};
        
        // Check for new chapters in completed submissions
        for (const progress of progressData) {
          if (progress.status === 'completed') {
            // Check if there are new chapters
            const hasNewChapters = await checkForNewChapters(progress.induction_id, progress);
            if (hasNewChapters) {
              // Reload progress to get updated status
              const updatedProgress = await userProgressApi.getAll();
              const updated = updatedProgress.find((p: any) => p.induction_id === progress.induction_id);
              if (updated) {
                submissionsMap[progress.induction_id] = updated;
                continue;
              }
            }
          }
          submissionsMap[progress.induction_id] = progress;
        }
        
        setSubmissions(submissionsMap);
      } catch (error) {
        console.error('Failed to load submissions:', error);
      }
    } catch (error) {
      console.error('Failed to load inductions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCompleted = (submissionId: number) => {
    router.push(`/inductions/${submissionId}/view`);
  };

  const handleStart = async (inductionId: number) => {
    try {
      const response = await inductionApi.start(inductionId);
      // Check if response indicates completed submission with no new chapters
      if (response.completed && response.submission && !response.has_new_chapters) {
        // Redirect to view page for completed induction
        router.push(`/inductions/${response.submission.id}/view`);
        return;
      }
      // Check if there are new chapters
      if (response.has_new_chapters && response.submission) {
        // Redirect to continue with new chapters
        const submission = response.submission;
        // Find first new chapter or continue from where they left off
        router.push(`/inductions/${submission.id}/chapter/1`);
        return;
      }
      const submission = response.submission || response;
      
      // Check if submission is pending or in_progress - resume from last unanswered
      if (submission.status === 'pending' || submission.status === 'in_progress') {
        // Try to get last unanswered question/chapter
        try {
          const { submissionApi } = await import('@/lib/api');
          const lastUnanswered = await submissionApi.getLastUnanswered(submission.id);
          
          if (lastUnanswered.last_unanswered_chapter) {
            // Find the chapter index in the snapshot
            const snapshot = submission.induction_snapshot;
            const chapterIndex = snapshot?.chapters?.findIndex(
              (ch: any) => ch.id === lastUnanswered.last_unanswered_chapter.id
            );
            
            if (chapterIndex !== undefined && chapterIndex >= 0) {
              // Check if video is completed for this chapter
              const chapter = snapshot.chapters[chapterIndex];
              const { videoCompletionApi } = await import('@/lib/api');
              try {
                const videoStatus = await videoCompletionApi.checkCompletion(chapter.id, submission.id);
                if (videoStatus.is_completed) {
                  // Video completed, go to questions
                  router.push(`/inductions/${submission.id}/chapter/${chapterIndex + 1}/questions`);
                } else {
                  // Video not completed, go to video
                  router.push(`/inductions/${submission.id}/chapter/${chapterIndex + 1}`);
                }
              } catch {
                // If check fails, go to video
                router.push(`/inductions/${submission.id}/chapter/${chapterIndex + 1}`);
              }
              return;
            }
          }
        } catch (error) {
          console.error('Failed to get last unanswered:', error);
        }
        
        // Fallback: start from first chapter
        router.push(`/inductions/${submission.id}/chapter/1`);
      } else {
        router.push(`/inductions/${submission.id}/chapter/1`);
      }
    } catch (error: any) {
      alert(error.message || 'Failed to start induction');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background-secondary">
        <Header showInductions={true} />
        <LoadingSpinner fullScreen text="Loading inductions..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-secondary">
      <Header showInductions={true} />
      <PageContainer title="Available Inductions" maxWidth="xl">
            {inductions.length === 0 ? (
              <EmptyState
                icon="📚"
                title="No Active Inductions"
                description="No active inductions available at this time. Please check back later."
              />
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {inductions.map((induction) => {
                  const submission = submissions[induction.id];
                  const isCompleted = submission?.status === 'completed';
                  const isPending = submission?.status === 'pending' || submission?.status === 'in_progress';
                  
                  return (
                    <Card key={induction.id} hover>
                      <h2 className="text-xl font-semibold text-foreground mb-2">{induction.title}</h2>
                      {induction.description && (
                        <p className="text-foreground-secondary mb-4">{induction.description}</p>
                      )}
                      
                      <div className="mb-4 space-y-2">
                        {isCompleted && (
                          <Alert variant="success">
                            <div>
                              <p className="font-medium">✓ Completed</p>
                              {submission.completed_at && (
                                <p className="text-xs mt-1">
                                  Completed on: {new Date(submission.completed_at).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </Alert>
                        )}
                        {isPending && (
                          <Alert variant="warning">
                            <div>
                              <p className="font-medium">⏳ In Progress</p>
                              <p className="text-xs mt-1">
                                {submission.progress?.completed_chapters || 0} of {submission.progress?.total_chapters || 0} chapters completed
                              </p>
                            </div>
                          </Alert>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        {isCompleted ? (
                          <>
                            <Button
                              variant="success"
                              fullWidth
                              onClick={() => handleViewCompleted(submission.submission_id)}
                            >
                              View Completed Induction
                            </Button>
                            <Button
                              variant="outline"
                              fullWidth
                              size="sm"
                              onClick={() => handleStart(induction.id)}
                            >
                              Check for New Chapters
                            </Button>
                          </>
                        ) : (
                          <Button
                            fullWidth
                            onClick={() => handleStart(induction.id)}
                          >
                            {isPending ? 'Continue Induction' : 'Start Induction'}
                          </Button>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
      </PageContainer>
    </div>
  );
}

