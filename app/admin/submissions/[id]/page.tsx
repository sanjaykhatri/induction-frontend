'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../providers';
import { adminSubmissionApi } from '@/lib/api';
import { LoadingSpinner, Card, Badge, PageContainer, Button } from '@/components/ui';

export default function SubmissionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const submissionId = parseInt(params.id as string);
  const { user, loading: authLoading, isAdmin, logout } = useAuth();
  const [submissionData, setSubmissionData] = useState<any>(null);
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

    loadSubmission();
  }, [user, authLoading, isAdmin, router, submissionId]);

  const loadSubmission = async () => {
    try {
      const data = await adminSubmissionApi.get(submissionId);
      setSubmissionData(data);
    } catch (error) {
      console.error('Failed to load submission:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAnswer = (answer: any, questionType: string, options: any[]) => {
    if (!answer) return 'Not answered';
    
    if (questionType === 'text') {
      return answer;
    } else if (questionType === 'single_choice') {
      const option = options.find((opt: any) => opt.id === answer);
      return option ? option.label : answer;
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
    
    // correct_answer is stored as array in database
    const answerArray = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
    
    if (questionType === 'text') {
      // For text, array contains one string element
      return answerArray[0] || 'Not set';
    } else if (questionType === 'single_choice') {
      // For single choice, array contains one option ID
      const answerId = answerArray[0];
      const option = options.find((opt: any) => opt.id === answerId);
      return option ? option.label : answerId;
    } else if (questionType === 'multi_choice') {
      // For multi choice, array contains multiple option IDs
      return answerArray.map((ans: string) => {
        const option = options.find((opt: any) => opt.id === ans);
        return option ? option.label : ans;
      }).join(', ');
    }
    return JSON.stringify(correctAnswer);
  };

  if (authLoading || loading) {
    return <LoadingSpinner fullScreen text="Loading..." />;
  }

  if (!submissionData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-foreground-secondary">Submission not found</p>
      </div>
    );
  }

  const { submission, statistics, questions } = submissionData;

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
        <PageContainer
          title="Submission Details"
          maxWidth="full"
        >
          <div className="mb-6">
            <Link href="/admin/submissions" className="text-primary hover:text-primary-dark mb-4 inline-block">
              ← Back to Submissions
            </Link>
          </div>

          {/* User Details */}
          <Card className="mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">User Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-foreground-secondary">Name</p>
              <p className="font-medium text-foreground">{submission.user?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-foreground-secondary">Email</p>
              <p className="font-medium text-foreground">{submission.user?.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-foreground-secondary">Company</p>
              <p className="font-medium text-foreground">{submission.user?.company || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-foreground-secondary">Vantage Card Number</p>
              <p className="font-medium text-foreground">{submission.user?.vantage_card_number || 'N/A'}</p>
            </div>
          </div>
          </Card>

          {/* Statistics */}
          <Card className="mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{statistics.total_questions}</p>
              <p className="text-sm text-foreground-secondary">Total Questions</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{statistics.correct_answers}</p>
              <p className="text-sm text-foreground-secondary">Correct</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{statistics.wrong_answers}</p>
              <p className="text-sm text-foreground-secondary">Wrong</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{statistics.unanswered}</p>
              <p className="text-sm text-foreground-secondary">Unanswered</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{statistics.score_percentage}%</p>
              <p className="text-sm text-foreground-secondary">Score</p>
            </div>
          </div>
          </Card>

          {/* Submission Info */}
          <Card className="mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Submission Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-foreground-secondary">Induction</p>
              <p className="font-medium text-foreground">{submission.induction?.title || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-foreground-secondary">Status</p>
              <Badge
                variant={
                  submission.status === 'completed'
                    ? 'success'
                    : submission.status === 'pending'
                    ? 'warning'
                    : 'info'
                }
              >
                {submission.status === 'completed' ? 'Completed' : submission.status === 'pending' ? 'Pending' : 'In Progress'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-foreground-secondary">Started At</p>
              <p className="font-medium text-foreground">
                {submission.created_at ? new Date(submission.created_at).toLocaleString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-foreground-secondary">Completed At</p>
              <p className="font-medium text-foreground">
                {submission.completed_at ? new Date(submission.completed_at).toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>
          </Card>

          {/* Questions and Answers */}
          <Card>
            <h2 className="text-xl font-semibold text-foreground mb-4">Questions & Answers</h2>
            <div className="space-y-6">
              {questions.map((q: any, index: number) => (
                <Card
                  key={q.question_id}
                  className={
                    q.is_correct
                      ? 'border-green-300 bg-green-50'
                      : q.is_answered
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 bg-gray-50'
                  }
                  padding="md"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-sm font-medium text-foreground-secondary">
                          Question {index + 1}
                        </span>
                        <Badge variant="default" className="text-xs">{q.chapter_title}</Badge>
                        <Badge variant="default" className="text-xs">{q.question_type}</Badge>
                        {q.is_correct && (
                          <Badge variant="success">✓ Correct</Badge>
                        )}
                        {q.is_answered && !q.is_correct && (
                          <Badge variant="danger">✗ Wrong</Badge>
                        )}
                        {!q.is_answered && (
                          <Badge variant="warning">Not Answered</Badge>
                        )}
                      </div>
                      <p className="font-medium text-foreground mb-3">{q.question_text}</p>
                    </div>
                  </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-sm font-medium text-foreground-secondary mb-1">User Answer:</p>
                    <p className={`p-2 rounded ${
                      q.is_correct
                        ? 'bg-green-100 text-green-800'
                        : q.is_answered
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {formatAnswer(q.user_answer, q.question_type, q.question_options)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground-secondary mb-1">Correct Answer:</p>
                    <p className="p-2 rounded bg-blue-100 text-blue-800">
                      {formatCorrectAnswer(q.correct_answer, q.question_type, q.question_options)}
                    </p>
                  </div>
                </div>

                {q.question_options && q.question_options.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-foreground-secondary mb-1">Available Options:</p>
                    <div className="flex flex-wrap gap-2">
                      {q.question_options.map((opt: any, optIdx: number) => (
                        <span
                          key={optIdx}
                          className="text-xs px-2 py-1 rounded bg-background-secondary"
                        >
                          {opt.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                </Card>
              ))}
            </div>
          </Card>
        </PageContainer>
      </main>
    </div>
  );
}

