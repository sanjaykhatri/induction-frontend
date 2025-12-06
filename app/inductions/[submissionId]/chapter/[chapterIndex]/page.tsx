'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../providers';
import { submissionApi, videoCompletionApi } from '@/lib/api';
import VideoPlayer from '@/components/VideoPlayer';
import Header from '@/components/Header';

export default function ChapterPage() {
  const router = useRouter();
  const params = useParams();
  const submissionId = parseInt(params.submissionId as string);
  const chapterIndex = parseInt(params.chapterIndex as string) - 1;
  const { user, logout } = useAuth();
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentChapter, setCurrentChapter] = useState<any>(null);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [checkingCompletion, setCheckingCompletion] = useState(true);

  useEffect(() => {
    loadSubmission();
  }, [submissionId, chapterIndex]);

  const findNextUncompletedChapterIndex = async (chapters: any[], startIndex: number, submissionId: number): Promise<number | null> => {
    for (let i = startIndex; i < chapters.length; i++) {
      const chapter = chapters[i];
      
      // Check video completion
      try {
        const videoCompletion = await videoCompletionApi.checkCompletion(chapter.id, submissionId);
        if (!videoCompletion.is_completed) {
          return i; // Found uncompleted chapter
        }
        
        // Check if all questions are answered for this chapter
        const chapterQuestions = chapter.questions || [];
        if (chapterQuestions.length > 0) {
          const submissionData = await submissionApi.get(submissionId);
          const allQuestionsAnswered = chapterQuestions.every((q: any) => {
            return submissionData.answers?.some((ans: any) => 
              ans.question_id === q.id || ans.question?.id === q.id
            );
          });
          
          if (!allQuestionsAnswered) {
            return i; // Found chapter with unanswered questions
          }
        }
      } catch (error) {
        // If check fails, assume not completed
        return i;
      }
    }
    return null; // All chapters completed
  };

  const loadSubmission = async () => {
    try {
      const data = await submissionApi.get(submissionId);
      setSubmission(data);
      
      if (!data.induction_snapshot?.chapters) {
        return;
      }
      
      const chapters = data.induction_snapshot.chapters;
      
      // Check if current chapter is already completed
      if (chapters[chapterIndex]) {
        const chapter = chapters[chapterIndex];
        
        // Check video completion
        try {
          const videoCompletion = await videoCompletionApi.checkCompletion(
            chapter.id,
            submissionId
          );
          
          // Check if all questions are answered
          const chapterQuestions = chapter.questions || [];
          let allQuestionsAnswered = true;
          
          if (chapterQuestions.length > 0) {
            allQuestionsAnswered = chapterQuestions.every((q: any) => {
              return data.answers?.some((ans: any) => 
                ans.question_id === q.id || ans.question?.id === q.id
              );
            });
          }
          
          // If both video and questions are completed, find next uncompleted chapter
          if (videoCompletion.is_completed && allQuestionsAnswered) {
            const nextUncompletedIndex = await findNextUncompletedChapterIndex(chapters, chapterIndex + 1, submissionId);
            
            if (nextUncompletedIndex !== null && nextUncompletedIndex >= 0) {
              // Redirect to next uncompleted chapter
              router.push(`/inductions/${submissionId}/chapter/${nextUncompletedIndex + 1}`);
              return;
            } else {
              // All chapters completed, try to finalize and redirect to view page
              try {
                await submissionApi.complete(submissionId);
              } catch (error) {
                console.error('Failed to complete submission:', error);
              }
              router.push(`/inductions/${submissionId}/view`);
              return;
            }
          }
          
          setVideoCompleted(videoCompletion.is_completed);
        } catch (error) {
          console.error('Failed to check completion:', error);
          setVideoCompleted(false);
        }
        
        setCurrentChapter(chapter);
      }
    } catch (error) {
      console.error('Failed to load submission:', error);
    } finally {
      setLoading(false);
      setCheckingCompletion(false);
    }
  };

  const handleVideoComplete = () => {
    setVideoCompleted(true);
  };

  const handleContinue = () => {
    if (!videoCompleted) {
      alert('Please complete watching the video before proceeding to questions.');
      return;
    }

    const nextChapterIndex = chapterIndex + 1;
    if (submission?.induction_snapshot?.chapters?.[nextChapterIndex]) {
      router.push(`/inductions/${submissionId}/chapter/${nextChapterIndex + 1}/questions`);
    } else {
      // Last chapter, go to questions
      router.push(`/inductions/${submissionId}/chapter/${chapterIndex + 1}/questions`);
    }
  };

  if (loading || checkingCompletion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-foreground-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentChapter) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-foreground-secondary">Chapter not found</p>
        </div>
      </div>
    );
  }

  // Construct video URL - prefer video_path if it exists (for uploaded files)
  // Otherwise use video_url (for external URLs like YouTube)
  // The backend should have already converted video_path to full URL in the snapshot
  // But we'll handle both cases for safety
  const videoUrl = currentChapter.video_path
    ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'}/storage/${currentChapter.video_path}`
    : (currentChapter.video_url || null);

  return (
    <div className="min-h-screen bg-background-secondary">
      <header className="bg-background shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="logo-placeholder">LOGO</div>
            <div className="flex items-center gap-4">
              <a href="/progress" className="text-primary hover:text-primary-dark">
                My Progress
              </a>
              <div className="text-right">
                <p className="font-medium text-foreground">{user?.name}</p>
                <p className="text-sm text-foreground-secondary">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm text-foreground-secondary hover:text-foreground border border-theme rounded-md hover:bg-background-secondary transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h1 className="text-2xl font-bold text-foreground mb-4">{currentChapter.title}</h1>
            {currentChapter.description && (
              <p className="text-foreground-secondary mb-6">{currentChapter.description}</p>
            )}
            
            {videoUrl ? (
              <VideoPlayer
                videoUrl={videoUrl}
                chapterId={currentChapter.id}
                submissionId={submissionId}
                onComplete={handleVideoComplete}
                disabled={false}
              />
            ) : (
              <div className="bg-background rounded-lg shadow-md p-8 text-center">
                <p className="text-foreground-secondary">No video available for this chapter.</p>
              </div>
            )}

            <div className="mt-6">
              <button
                onClick={handleContinue}
                disabled={!videoCompleted}
                className={`py-2 px-6 rounded-md transition-colors ${
                  videoCompleted
                    ? 'bg-primary text-white hover:bg-primary-dark'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {videoCompleted ? 'Continue to Questions' : 'Complete Video to Continue'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-background rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Chapter Progress</h2>
              <div className="space-y-2">
                {submission?.induction_snapshot?.chapters?.map((chapter: any, index: number) => {
                  const isCurrent = index === chapterIndex;
                  const isCompleted = index < chapterIndex;
                  return (
                    <div
                      key={chapter.id}
                      className={`p-3 rounded ${
                        isCurrent
                          ? 'bg-primary text-white'
                          : isCompleted
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isCompleted && (
                          <span className="text-green-600">✓</span>
                        )}
                        <span className="text-sm font-medium">
                          {index + 1}. {chapter.title}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
