'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../providers';
import { submissionApi } from '@/lib/api';
import Header from '@/components/Header';
import { LoadingSpinner, Card, Badge, PageContainer, Button, Alert } from '@/components/ui';

export default function ViewCompletedInductionPage() {
  const router = useRouter();
  const params = useParams();
  const submissionId = parseInt(params.submissionId as string);
  const { user, loading: authLoading, logout } = useAuth();
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChapterIndex, setSelectedChapterIndex] = useState<number>(0);
  const [hasNewChapters, setHasNewChapters] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && (user.role === 'admin' || user.role === 'super_admin')) {
      router.push('/admin/dashboard');
      return;
    }

    loadSubmission();
  }, [user, authLoading, router, submissionId]);

  const loadSubmission = async () => {
    try {
      const data = await submissionApi.get(submissionId);
      
      // Verify this submission belongs to the current user
      if (data.user_id !== user?.id && data.user?.id !== user?.id) {
        router.push('/inductions');
        return;
      }

      // Check for new chapters - if status is pending after being completed, there are new chapters
      const wasCompleted = data.status === 'completed' || data.completed_at !== null;
      const isPending = data.status === 'pending';
      
      if (wasCompleted && isPending) {
        setHasNewChapters(true);
      }

      // Allow viewing if completed or has new chapters
      if (data.status !== 'completed' && !isPending) {
        router.push(`/inductions/${submissionId}/chapter/1`);
        return;
      }

      setSubmission(data);
    } catch (error) {
      console.error('Failed to load submission:', error);
      router.push('/inductions');
    } finally {
      setLoading(false);
    }
  };

  const formatAnswer = (answer: any, questionType: string, options: any[]) => {
    if (!answer) return 'Not answered';
    
    if (questionType === 'text') {
      return answer;
    } else if (questionType === 'single_choice') {
      const answerValue = Array.isArray(answer) ? answer[0] : answer;
      const option = options.find((opt: any) => opt.id === answerValue);
      return option ? option.label : answerValue;
    } else if (questionType === 'multi_choice') {
      const answerArray = Array.isArray(answer) ? answer : [answer];
      return answerArray.map((ans: string) => {
        const option = options.find((opt: any) => opt.id === ans);
        return option ? option.label : ans;
      }).join(', ');
    }
    return JSON.stringify(answer);
  };

  const formatCorrectAnswer = (correctAnswer: any, questionType: string, options: any[]) => {
    if (!correctAnswer) return 'Not set';
    
    const answerArray = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
    
    if (questionType === 'text') {
      return answerArray[0] || 'Not set';
    } else if (questionType === 'single_choice') {
      const answerId = answerArray[0];
      const option = options.find((opt: any) => opt.id === answerId);
      return option ? option.label : answerId;
    } else if (questionType === 'multi_choice') {
      return answerArray.map((ans: string) => {
        const option = options.find((opt: any) => opt.id === ans);
        return option ? option.label : ans;
      }).join(', ');
    }
    return JSON.stringify(correctAnswer);
  };

  const compareAnswers = (question: any, userAnswer: any) => {
    if (!userAnswer || !question.correct_answer) return false;

    try {
      // Parse correct_answer - handle both JSON string and array formats
      let correctAnswer = question.correct_answer;
      if (typeof correctAnswer === 'string') {
        try {
          correctAnswer = JSON.parse(correctAnswer);
        } catch {
          // If parsing fails, use the string as-is
        }
      }
      
      // Ensure correct_answer is in array format
      const correctAnswerArray = Array.isArray(correctAnswer) 
        ? correctAnswer 
        : (correctAnswer !== null && correctAnswer !== undefined ? [correctAnswer] : []);

      if (correctAnswerArray.length === 0) return false;

      // Parse user answer_payload - handle both JSON string and array formats
      let payload = userAnswer.answer_payload;
      if (typeof payload === 'string') {
        try {
          payload = JSON.parse(payload);
        } catch {
          // If parsing fails, use the string as-is
        }
      }
      
      // Ensure payload is in array format
      const payloadArray = Array.isArray(payload) 
        ? payload 
        : (payload !== null && payload !== undefined ? [payload] : []);

      if (payloadArray.length === 0) return false;

      // Compare based on question type
      if (question.type === 'single_choice' || question.type === 'text') {
        // For single choice and text, compare first elements as strings (case-insensitive for text)
        const correctValue = String(correctAnswerArray[0]).trim();
        const userValue = String(payloadArray[0]).trim();
        
        if (question.type === 'text') {
          return correctValue.toLowerCase() === userValue.toLowerCase();
        } else {
          return correctValue === userValue;
        }
      } else if (question.type === 'multi_choice') {
        // For multi-choice, compare arrays (order doesn't matter)
        // Convert all values to strings, filter empty, and sort for comparison
        const sortedCorrect = correctAnswerArray
          .map(String)
          .map(v => v.trim())
          .filter(v => v !== '')
          .sort();
        const sortedPayload = payloadArray
          .map(String)
          .map(v => v.trim())
          .filter(v => v !== '')
          .sort();
        
        // Check if arrays have same length and same values
        if (sortedCorrect.length !== sortedPayload.length) return false;
        
        return sortedCorrect.every((val, idx) => val === sortedPayload[idx]);
      }
    } catch (e) {
      console.error("Error comparing answers:", e, { 
        question: { id: question.id, type: question.type, correct_answer: question.correct_answer },
        userAnswer: { answer_payload: userAnswer.answer_payload }
      });
    }
    return false;
  };

  if (authLoading || loading) {
    return <LoadingSpinner fullScreen text="Loading..." />;
  }

  if (!submission || submission.status !== 'completed') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-foreground-secondary">Submission not found or not completed.</p>
          <Button
            onClick={() => router.push('/inductions')}
          >
            Back to Inductions
          </Button>
        </div>
      </div>
    );
  }

  const snapshot = submission.induction_snapshot;
  const chapters = snapshot?.chapters || [];
  const currentChapter = chapters[selectedChapterIndex];

  return (
    <div className="min-h-screen bg-background-secondary">
      <Header showProgress={true} showInductions={true} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {snapshot?.induction?.title || 'Completed Induction'}
          </h1>
          <div className="flex items-center gap-4 flex-wrap">
            {submission.status === 'completed' ? (
              <>
                <Badge variant="success">✓ Completed</Badge>
                {submission.completed_at && (
                  <span className="text-sm text-foreground-secondary">
                    Completed on: {new Date(submission.completed_at).toLocaleDateString()}
                  </span>
                )}
              </>
            ) : (
              <Badge variant="warning">⏳ New Chapters Available</Badge>
            )}
            {hasNewChapters && (
              <Button
                size="sm"
                onClick={() => router.push(`/inductions/${submissionId}/chapter/1`)}
              >
                Complete New Chapters
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chapter Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4" padding="md">
              <h2 className="text-lg font-semibold text-foreground mb-4">Chapters</h2>
              <div className="space-y-2">
                {chapters.map((chapter: any, index: number) => (
                  <Button
                    key={chapter.id}
                    variant={selectedChapterIndex === index ? 'primary' : 'outline'}
                    size="sm"
                    fullWidth
                    onClick={() => setSelectedChapterIndex(index)}
                    className="justify-start"
                  >
                    <span className="text-sm font-medium">
                      {index + 1}. {chapter.title}
                    </span>
                    <span className="ml-auto text-xs">✓</span>
                  </Button>
                ))}
              </div>
            </Card>
          </div>

          {/* Chapter Content */}
          <div className="lg:col-span-3">
            {currentChapter ? (
              <Card>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  {currentChapter.title}
                </h2>
                {currentChapter.description && (
                  <p className="text-foreground-secondary mb-6">{currentChapter.description}</p>
                )}

                {/* Video Section */}
                {currentChapter.video_url && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-foreground mb-2">Video</h3>
                    <Card className="bg-background-secondary" padding="md">
                      <video
                        controls
                        className="w-full rounded-md"
                        src={currentChapter.video_url}
                      >
                        Your browser does not support the video tag.
                      </video>
                    </Card>
                  </div>
                )}

                {/* Questions Section */}
                {currentChapter.questions && currentChapter.questions.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Questions & Answers</h3>
                    <div className="space-y-6">
                      {currentChapter.questions.map((question: any, qIndex: number) => {
                        const userAnswer = submission.answers?.find(
                          (ans: any) => ans.question_id === question.id || ans.question?.id === question.id
                        );
                        const isCorrect = userAnswer ? compareAnswers(question, userAnswer) : false;

                        return (
                          <Card
                            key={question.id}
                            className={
                              isCorrect
                                ? 'border-green-300 bg-green-50'
                                : userAnswer
                                ? 'border-red-300 bg-red-50'
                                : 'border-gray-300 bg-gray-50'
                            }
                            padding="md"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-foreground">
                                Question {qIndex + 1}: {question.question_text}
                              </h4>
                              {userAnswer && (
                                <Badge variant={isCorrect ? 'success' : 'danger'}>
                                  {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                                </Badge>
                              )}
                            </div>

                            {question.type !== 'text' && question.options && (
                              <div className="mb-3">
                                <p className="text-sm font-medium text-foreground-secondary mb-2">
                                  Options:
                                </p>
                                <div className="space-y-1">
                                  {question.options.map((option: any) => {
                                    const isSelected = userAnswer && (
                                      Array.isArray(userAnswer.answer_payload)
                                        ? userAnswer.answer_payload.includes(option.id)
                                        : userAnswer.answer_payload === option.id
                                    );

                                    return (
                                      <div
                                        key={option.id}
                                        className={`p-2 rounded ${
                                          isSelected
                                            ? isCorrect
                                              ? 'bg-green-100 border border-green-300'
                                              : 'bg-red-100 border border-red-300'
                                            : 'bg-background-secondary'
                                        }`}
                                      >
                                        <span className="text-sm">
                                          {isSelected && isCorrect && '✓ '}
                                          {isSelected && !isCorrect && '✗ '}
                                          {option.label}
                                          {isSelected && isCorrect && ' (Your Answer - Correct)'}
                                          {isSelected && !isCorrect && ' (Your Answer - Incorrect)'}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            <div className="mt-4">
                              <p className="text-sm font-medium text-foreground-secondary mb-1">
                                Your Answer:
                              </p>
                              <p
                                className={`p-2 rounded ${
                                  isCorrect
                                    ? 'bg-green-100 text-green-800'
                                    : userAnswer
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {formatAnswer(
                                  userAnswer?.answer_payload,
                                  question.type,
                                  question.options || []
                                )}
                              </p>
                              {userAnswer && (
                                <p className={`mt-2 text-sm font-medium ${
                                  isCorrect ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {isCorrect ? '✓ Correct Answer' : '✗ Incorrect Answer'}
                                </p>
                              )}
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Card>
            ) : (
              <Card className="text-center" padding="lg">
                <p className="text-foreground-secondary">No chapter selected</p>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

