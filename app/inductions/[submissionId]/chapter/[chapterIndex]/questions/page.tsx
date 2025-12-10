'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../../providers';
import { submissionApi, videoCompletionApi, SubmitAnswersResponse } from '@/lib/api';
import Header from '@/components/Header';

export default function QuestionsPage() {
  const router = useRouter();
  const params = useParams();
  const submissionId = parseInt(params.submissionId as string);
  const chapterIndex = parseInt(params.chapterIndex as string) - 1;
  const { user, logout } = useAuth();
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentChapter, setCurrentChapter] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [checkingVideo, setCheckingVideo] = useState(true);

  useEffect(() => {
    loadSubmission();
  }, [submissionId]);

  const findNextUncompletedChapterIndex = async (chapters: any[], startIndex: number, submissionId: number): Promise<number | null> => {
    for (let i = startIndex; i < chapters.length; i++) {
      const chapter = chapters[i];
      
      // Check video completion
      try {
        const videoCompletion = await videoCompletionApi.checkCompletion(chapter.id, submissionId);
        if (!videoCompletion.is_completed) {
          return i; // Found chapter with uncompleted video
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
        // If video and questions are both completed, continue to next chapter
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
      
      if (!data.induction_snapshot?.chapters?.[chapterIndex]) {
        return;
      }
      
      const chapters = data.induction_snapshot.chapters;
      const chapter = chapters[chapterIndex];
      
      // Check if video is completed
      try {
        const completion = await videoCompletionApi.checkCompletion(
          chapter.id,
          submissionId
        );
        setVideoCompleted(completion.is_completed);
        
        if (!completion.is_completed) {
          // Redirect back to video if not completed
          router.push(`/inductions/${submissionId}/chapter/${chapterIndex + 1}`);
          return;
        }
      } catch (error) {
        console.error('Failed to check video completion:', error);
        // Redirect back to video on error
        router.push(`/inductions/${submissionId}/chapter/${chapterIndex + 1}`);
        return;
      }
      
      // Check if all questions for this chapter are already answered
      const chapterQuestions = chapter.questions || [];
      if (chapterQuestions.length > 0) {
        const allQuestionsAnswered = chapterQuestions.every((q: any) => {
          return data.answers?.some((ans: any) => 
            ans.question_id === q.id || ans.question?.id === q.id
          );
        });
        
        if (allQuestionsAnswered) {
          // All questions answered, find next uncompleted chapter
          const nextChapterIndex = await findNextUncompletedChapterIndex(chapters, chapterIndex + 1, submissionId);
          
          if (nextChapterIndex !== null && nextChapterIndex >= 0) {
            // Found next uncompleted chapter
            const nextChapter = chapters[nextChapterIndex];
            
            // Check if video is completed for next chapter
            try {
              const videoStatus = await videoCompletionApi.checkCompletion(nextChapter.id, submissionId);
              if (videoStatus.is_completed) {
                // Video completed, go to questions
                router.push(`/inductions/${submissionId}/chapter/${nextChapterIndex + 1}/questions`);
              } else {
                // Video not completed, go to video
                router.push(`/inductions/${submissionId}/chapter/${nextChapterIndex + 1}`);
              }
            } catch {
              // If check fails, go to video
              router.push(`/inductions/${submissionId}/chapter/${nextChapterIndex + 1}`);
            }
            return;
          } else {
            // All chapters completed
            if (data.status === 'completed') {
              router.push(`/inductions/${submissionId}/view`);
              return;
            }
          }
        }
      }
      
      setCurrentChapter(chapter);
      
      // Load existing answers
      if (data.answers) {
        const existingAnswers: Record<number, any> = {};
        data.answers.forEach((answer: any) => {
          existingAnswers[answer.question_id] = answer.answer_payload;
        });
        setAnswers(existingAnswers);
      }
    } catch (error) {
      console.error('Failed to load submission:', error);
    } finally {
      setLoading(false);
      setCheckingVideo(false);
    }
  };

  const handleAnswerChange = (questionId: number, value: any) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleSubmit = async () => {
    if (!videoCompleted) {
      alert('Please complete watching the video before submitting answers.');
      router.push(`/inductions/${submissionId}/chapter/${chapterIndex + 1}`);
      return;
    }

    // Check if all questions for this chapter are answered
    const unansweredQuestions = questions.filter((q: any) => {
      const answer = answers[q.id];
      if (q.type === 'multi_choice') {
        return !answer || !Array.isArray(answer) || answer.length === 0;
      }
      return !answer || answer === '';
    });

    if (unansweredQuestions.length > 0) {
      alert(`Please answer all questions before submitting. ${unansweredQuestions.length} question(s) remaining.`);
      return;
    }

    setSubmitting(true);
    try {
      const answerArray = Object.entries(answers).map(([questionId, payload]) => ({
        question_id: parseInt(questionId),
        answer_payload: payload,
      }));

      const response = await submissionApi.submitAnswers(submissionId, currentChapter.id, answerArray);

      // Reload submission to get updated data
      const updatedSubmission = await submissionApi.get(submissionId);
      const chapters = updatedSubmission.induction_snapshot?.chapters || [];

      // Check if submission is completed
      if (response.status === 'completed') {
        // All chapters completed - redirect to view page
        router.push(`/inductions/${submissionId}/view`);
        return;
      }

      // Find next uncompleted chapter sequentially
      const nextChapterIndex = await findNextUncompletedChapterIndex(chapters, chapterIndex + 1, submissionId);
      
      if (nextChapterIndex !== null && nextChapterIndex >= 0) {
        // Found next uncompleted chapter - navigate to it
        const nextChapter = chapters[nextChapterIndex];
        
        // Check if video is completed for next chapter
        try {
          const videoStatus = await videoCompletionApi.checkCompletion(nextChapter.id, submissionId);
          if (videoStatus.is_completed) {
            // Video completed, go to questions
            router.push(`/inductions/${submissionId}/chapter/${nextChapterIndex + 1}/questions`);
          } else {
            // Video not completed, go to video
            router.push(`/inductions/${submissionId}/chapter/${nextChapterIndex + 1}`);
          }
        } catch {
          // If check fails, go to video
          router.push(`/inductions/${submissionId}/chapter/${nextChapterIndex + 1}`);
        }
      } else {
        // All chapters appear completed, try to finalize submission
        try {
          await submissionApi.complete(submissionId);
          router.push(`/inductions/${submissionId}/view`);
        } catch (error: any) {
          // Check if error response contains has_new_chapters flag
          if (error.response?.has_new_chapters || error.message?.includes('New chapters have been added')) {
            // New chapters detected, reload submission and redirect to first new chapter
            const updatedSubmission = await submissionApi.get(submissionId);
            const updatedChapters = updatedSubmission.induction_snapshot?.chapters || [];
            // Find first new chapter (one that wasn't in original chapters)
            const originalChapterIds = chapters.map((ch: any) => ch.id);
            const firstNewChapterIndex = updatedChapters.findIndex((ch: any) => !originalChapterIds.includes(ch.id));
            if (firstNewChapterIndex >= 0) {
              router.push(`/inductions/${submissionId}/chapter/${firstNewChapterIndex + 1}`);
            } else {
              router.push(`/inductions/${submissionId}/chapter/1`);
            }
          } else {
            // Some other error, redirect to view page
            console.error('Failed to complete submission:', error);
            router.push(`/inductions/${submissionId}/view`);
          }
        }
      }
    } catch (error: any) {
      alert(error.message || 'Failed to submit answers');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || checkingVideo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-foreground-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentChapter || !videoCompleted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-foreground-secondary">Chapter not found</p>
      </div>
    );
  }

  const questions = currentChapter.questions || [];

  return (
    <div className="min-h-screen bg-background-secondary">
      <header className="bg-background shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="logo-placeholder">LOGO</div>
            <div className="flex items-center gap-4">
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">
          Questions: {currentChapter.title}
        </h1>

        <div className="bg-background rounded-lg shadow-md p-6 space-y-6">
          {questions.length === 0 ? (
            <p className="text-foreground-secondary">No questions for this chapter.</p>
          ) : (
            questions.map((question: any) => (
              <div key={question.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  {question.question_text}
                </h3>

                {question.type === 'text' ? (
                  <textarea
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="w-full px-4 py-2 border border-theme rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows={4}
                    placeholder="Enter your answer..."
                  />
                ) : question.type === 'single_choice' ? (
                  <div className="space-y-2">
                    {question.options?.map((option: any) => (
                      <label
                        key={option.id}
                        className="flex items-center p-3 border border-theme rounded-md hover:bg-background-secondary cursor-pointer"
                      >
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={option.id}
                          checked={answers[question.id] === option.id}
                          onChange={() => handleAnswerChange(question.id, option.id)}
                          className="mr-3"
                        />
                        <span className="text-foreground">{option.label}</span>
                      </label>
                    ))}
                  </div>
                ) : question.type === 'multi_choice' ? (
                  <div className="space-y-2">
                    {question.options?.map((option: any) => (
                      <label
                        key={option.id}
                        className="flex items-center p-3 border border-theme rounded-md hover:bg-background-secondary cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={Array.isArray(answers[question.id]) && answers[question.id].includes(option.id)}
                          onChange={(e) => {
                            const current = Array.isArray(answers[question.id]) ? answers[question.id] : [];
                            const updated = e.target.checked
                              ? [...current, option.id]
                              : current.filter((id: any) => id !== option.id);
                            handleAnswerChange(question.id, updated);
                          }}
                          className="mr-3"
                        />
                        <span className="text-foreground">{option.label}</span>
                      </label>
                    ))}
                  </div>
                ) : null}
              </div>
            ))
          )}

          <div className="pt-6">
            <button
              onClick={handleSubmit}
              disabled={submitting || questions.length === 0}
              className="w-full bg-primary text-white py-2 px-6 rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting
                ? 'Submitting...'
                : submission?.induction_snapshot?.chapters?.[chapterIndex + 1]
                ? 'Next Chapter'
                : 'Complete Induction'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

