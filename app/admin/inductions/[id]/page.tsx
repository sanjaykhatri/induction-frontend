'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../providers';
import { adminInductionApi, adminChapterApi, adminQuestionApi } from '@/lib/api';

export default function InductionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const inductionId = parseInt(params.id as string);
  const { user, loading: authLoading, isAdmin, logout } = useAuth();
  const [induction, setInduction] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'chapters' | 'submissions'>('chapters');
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [editingChapter, setEditingChapter] = useState<any>(null);
  const [chapterFormData, setChapterFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    display_order: 0,
    pass_percentage: 70,
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [questionFormData, setQuestionFormData] = useState({
    question_text: '',
    type: 'single_choice' as 'single_choice' | 'multi_choice' | 'text',
    options: [] as Array<{ id: string; label: string }>,
    correct_answer: null as any,
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

    // Only load data when user is authenticated and token is set
    if (!authLoading && user && isAdmin()) {
      loadData();
    }
  }, [user, authLoading, isAdmin, router, inductionId]);

  const loadData = async () => {
    try {
      // Ensure we have a user before making API calls
      if (!user) {
        router.push('/admin/login');
        return;
      }

      const [inductionData, chaptersData] = await Promise.all([
        adminInductionApi.list().then(list => list.find((i: any) => i.id === inductionId)),
        adminChapterApi.list(inductionId),
      ]);
      setInduction(inductionData);
      setChapters(chaptersData);
    } catch (error: any) {
      console.error('Failed to load data:', error);
      // If unauthorized, redirect to login
      if (error.message?.includes('Unauthenticated') || error.message?.includes('401')) {
        router.push('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddChapter = () => {
    setEditingChapter(null);
    setChapterFormData({
      title: '',
      description: '',
      video_url: '',
      display_order: chapters.length,
      pass_percentage: 70,
    });
    setVideoFile(null);
    setShowChapterModal(true);
  };

  const handleEditChapter = (chapter: any) => {
    setEditingChapter(chapter);
    setChapterFormData({
      title: chapter.title,
      description: chapter.description || '',
      video_url: chapter.video_url || '',
      display_order: chapter.display_order,
      pass_percentage: chapter.pass_percentage || 70,
    });
    setVideoFile(null);
    setShowChapterModal(true);
  };

  const handleSaveChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
          formData.append('title', chapterFormData.title);
          formData.append('description', chapterFormData.description || '');
          formData.append('display_order', chapterFormData.display_order.toString());
          formData.append('pass_percentage', chapterFormData.pass_percentage.toString());
      
      if (videoFile) {
        formData.append('video_file', videoFile);
      } else if (chapterFormData.video_url) {
        formData.append('video_url', chapterFormData.video_url);
      }

      if (editingChapter) {
        await adminChapterApi.update(editingChapter.id, formData);
      } else {
        await adminChapterApi.create(inductionId, formData);
      }
      setShowChapterModal(false);
      setVideoFile(null);
      loadData();
    } catch (error: any) {
      alert(error.message || 'Failed to save chapter');
    }
  };

  const handleDeleteChapter = async (chapterId: number) => {
    if (!confirm('Are you sure you want to delete this chapter?')) return;

    try {
      await adminChapterApi.delete(chapterId);
      loadData();
    } catch (error: any) {
      alert(error.message || 'Failed to delete chapter');
    }
  };

  const handleManageQuestions = async (chapter: any) => {
    setSelectedChapter(chapter);
    setShowQuestionsModal(true);
    setLoadingQuestions(true);
    try {
      const questionsData = await adminQuestionApi.list(chapter.id);
      setQuestions(questionsData);
    } catch (error: any) {
      alert(error.message || 'Failed to load questions');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setQuestionFormData({
      question_text: '',
      type: 'single_choice',
      options: [{ id: '1', label: '' }, { id: '2', label: '' }],
      correct_answer: null,
      display_order: questions.length,
    });
    setShowQuestionForm(true);
  };

  const handleEditQuestion = (question: any) => {
    setEditingQuestion(question);
    
    // Normalize correct_answer for display based on question type
    let correctAnswer = question.correct_answer;
    if (question.type === 'single_choice' && Array.isArray(question.correct_answer) && question.correct_answer.length > 0) {
      // Extract single value from array
      correctAnswer = question.correct_answer[0];
    } else if (question.type === 'text' && Array.isArray(question.correct_answer) && question.correct_answer.length > 0) {
      // Extract text value from array
      correctAnswer = question.correct_answer[0];
    }
    // multi_choice stays as array
    
    setQuestionFormData({
      question_text: question.question_text,
      type: question.type,
      options: question.options || [{ id: '1', label: '' }, { id: '2', label: '' }],
      correct_answer: correctAnswer,
      display_order: question.display_order,
    });
    setShowQuestionForm(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!selectedChapter) return;

      const formData = { ...questionFormData };
      // Filter out empty options
      formData.options = formData.options.filter(opt => opt.label.trim() !== '');

      // Validate correct_answer based on question type
      if (formData.type === 'single_choice') {
        if (!formData.correct_answer || formData.correct_answer === '') {
          alert('Please select a correct answer for single choice question');
          return;
        }
      } else if (formData.type === 'multi_choice') {
        if (!formData.correct_answer || !Array.isArray(formData.correct_answer) || formData.correct_answer.length === 0) {
          alert('Please select at least one correct answer for multiple choice question');
          return;
        }
      }
      // Text questions can have optional correct_answer

      if (editingQuestion) {
        await adminQuestionApi.update(editingQuestion.id, formData);
      } else {
        await adminQuestionApi.create(selectedChapter.id, formData);
      }
      setShowQuestionForm(false);
      // Reload questions
      const questionsData = await adminQuestionApi.list(selectedChapter.id);
      setQuestions(questionsData);
    } catch (error: any) {
      alert(error.message || 'Failed to save question');
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      await adminQuestionApi.delete(questionId);
      if (selectedChapter) {
        const questionsData = await adminQuestionApi.list(selectedChapter.id);
        setQuestions(questionsData);
      }
    } catch (error: any) {
      alert(error.message || 'Failed to delete question');
    }
  };

  const addOption = () => {
    const newId = String(questionFormData.options.length + 1);
    setQuestionFormData({
      ...questionFormData,
      options: [...questionFormData.options, { id: newId, label: '' }],
    });
  };

  const removeOption = (index: number) => {
    const newOptions = questionFormData.options.filter((_, i) => i !== index);
    setQuestionFormData({ ...questionFormData, options: newOptions });
  };

  const updateOption = (index: number, field: 'id' | 'label', value: string) => {
    const newOptions = [...questionFormData.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setQuestionFormData({ ...questionFormData, options: newOptions });
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
        <div className="mb-6">
          <a href="/admin/inductions" className="text-primary hover:text-primary-dark mb-4 inline-block">
            ← Back to Inductions
          </a>
          <h1 className="text-3xl font-bold text-foreground">{induction?.title}</h1>
        </div>

        <div className="border-b mb-6">
          <nav className="flex gap-4">
            <button
              onClick={() => setActiveTab('chapters')}
              className={`pb-4 px-2 border-b-2 ${
                activeTab === 'chapters'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-foreground-secondary hover:text-foreground'
              }`}
            >
              Chapters
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`pb-4 px-2 border-b-2 ${
                activeTab === 'submissions'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-foreground-secondary hover:text-foreground'
              }`}
            >
              Submissions
            </button>
          </nav>
        </div>

        {activeTab === 'chapters' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-foreground">Chapters</h2>
              <button
                onClick={handleAddChapter}
                className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors"
              >
                Add Chapter
              </button>
            </div>
            {chapters.length === 0 ? (
              <div className="text-center py-12 bg-background rounded-lg">
                <p className="text-foreground-secondary mb-4">No chapters yet. Add your first chapter to get started.</p>
                <button
                  onClick={handleAddChapter}
                  className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors"
                >
                  Add First Chapter
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {chapters.map((chapter) => (
                  <div key={chapter.id} className="bg-background rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-2">{chapter.title}</h3>
                    {chapter.description && (
                      <p className="text-foreground-secondary mb-4">{chapter.description}</p>
                    )}
                    <p className="text-sm text-foreground-secondary mb-4">
                      Video URL: <a href={chapter.video_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{chapter.video_url}</a>
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditChapter(chapter)}
                        className="text-primary hover:text-primary-dark"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleManageQuestions(chapter)}
                        className="text-primary hover:text-primary-dark"
                      >
                        Manage Questions
                      </button>
                      <button
                        onClick={() => handleDeleteChapter(chapter.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'submissions' && (
          <div>
            <p className="text-foreground-secondary">Submissions for this induction will be listed here.</p>
            <a
              href={`/admin/submissions?induction_id=${inductionId}`}
              className="text-primary hover:text-primary-dark"
            >
              View all submissions →
            </a>
          </div>
        )}
      </main>

      {/* Questions Management Modal */}
      {showQuestionsModal && selectedChapter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-foreground">
                Questions for: {selectedChapter.title}
              </h2>
              <button
                onClick={() => {
                  setShowQuestionsModal(false);
                  setSelectedChapter(null);
                  setQuestions([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {loadingQuestions ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-foreground-secondary">Loading questions...</p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <button
                    onClick={handleAddQuestion}
                    className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors"
                  >
                    Add Question
                  </button>
                </div>

                {questions.length === 0 ? (
                  <div className="text-center py-8 bg-background-secondary rounded-lg">
                    <p className="text-foreground-secondary">No questions yet. Add your first question.</p>
                  </div>
                ) : (
                  <div className="space-y-4 mb-4">
                    {questions.map((question) => (
                      <div key={question.id} className="bg-background-secondary rounded-lg p-4 border">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-foreground mb-2">{question.question_text}</p>
                            <p className="text-sm text-foreground-secondary">
                              Type: {question.type} | Order: {question.display_order}
                            </p>
                            {question.options && question.options.length > 0 && (
                              <div className="mt-2">
                                <p className="text-sm font-medium text-foreground-secondary mb-1">Options:</p>
                                <ul className="list-disc list-inside text-sm text-foreground-secondary">
                                  {question.options.map((opt: any, idx: number) => (
                                    <li key={idx}>{opt.label}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditQuestion(question)}
                              className="text-primary hover:text-primary-dark text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(question.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Question Form Modal */}
      {showQuestionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {editingQuestion ? 'Edit Question' : 'Add Question'}
            </h2>
            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Question Text *
                </label>
                <textarea
                  required
                  value={questionFormData.question_text}
                  onChange={(e) => setQuestionFormData({ ...questionFormData, question_text: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Question Type *
                </label>
                <select
                  value={questionFormData.type}
                  onChange={(e) => {
                    const newType = e.target.value as 'single_choice' | 'multi_choice' | 'text';
                    setQuestionFormData({
                      ...questionFormData,
                      type: newType,
                      options: newType === 'text' ? [] : questionFormData.options.length === 0 
                        ? [{ id: '1', label: '' }, { id: '2', label: '' }] 
                        : questionFormData.options,
                    });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="single_choice">Single Choice</option>
                  <option value="multi_choice">Multiple Choice</option>
                  <option value="text">Text Input</option>
                </select>
              </div>

              {(questionFormData.type === 'single_choice' || questionFormData.type === 'multi_choice') && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-foreground">
                      Options *
                    </label>
                    <button
                      type="button"
                      onClick={addOption}
                      className="text-sm text-primary hover:text-primary-dark"
                    >
                      + Add Option
                    </button>
                  </div>
                  <div className="space-y-2">
                    {questionFormData.options.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={option.id}
                          onChange={(e) => updateOption(index, 'id', e.target.value)}
                          placeholder="Option ID"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        <input
                          type="text"
                          value={option.label}
                          onChange={(e) => updateOption(index, 'label', e.target.value)}
                          placeholder="Option Label"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        {questionFormData.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(index)}
                            className="text-red-600 hover:text-red-800 px-2"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  </div>
                )}

              {/* Correct Answer Field */}
              {questionFormData.type === 'single_choice' && questionFormData.options.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Correct Answer *
                  </label>
                  <select
                    required
                    value={questionFormData.correct_answer || ''}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, correct_answer: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select correct answer</option>
                    {questionFormData.options.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {questionFormData.type === 'multi_choice' && questionFormData.options.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Correct Answer(s) *
                  </label>
                  <div className="space-y-2 border border-gray-300 rounded-md p-3 max-h-40 overflow-y-auto">
                    {questionFormData.options.map((option) => {
                      const currentAnswers = Array.isArray(questionFormData.correct_answer) 
                        ? questionFormData.correct_answer 
                        : [];
                      return (
                        <label key={option.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={currentAnswers.includes(option.id)}
                            onChange={(e) => {
                              const current = Array.isArray(questionFormData.correct_answer) 
                                ? questionFormData.correct_answer 
                                : [];
                              const updated = e.target.checked
                                ? [...current, option.id]
                                : current.filter((id: string) => id !== option.id);
                              setQuestionFormData({ ...questionFormData, correct_answer: updated });
                            }}
                            className="mr-2"
                          />
                          <span className="text-foreground">{option.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {questionFormData.type === 'text' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Correct Answer (Optional - for reference)
                  </label>
                  <input
                    type="text"
                    value={questionFormData.correct_answer || ''}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, correct_answer: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Expected answer (for admin reference)"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={questionFormData.display_order}
                  onChange={(e) => setQuestionFormData({ ...questionFormData, display_order: parseInt(e.target.value) || 0 })}
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
                  onClick={() => setShowQuestionForm(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chapter Modal */}
      {showChapterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {editingChapter ? 'Edit Chapter' : 'Add Chapter'}
            </h2>
            <form onSubmit={handleSaveChapter} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={chapterFormData.title}
                  onChange={(e) => setChapterFormData({ ...chapterFormData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Description
                </label>
                <textarea
                  value={chapterFormData.description}
                  onChange={(e) => setChapterFormData({ ...chapterFormData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Video File (or Video URL)
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setVideoFile(file);
                      setChapterFormData({ ...chapterFormData, video_url: '' });
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                {videoFile && (
                  <p className="mt-1 text-sm text-foreground-secondary">
                    Selected: {videoFile.name}
                  </p>
                )}
                {!videoFile && (
                  <>
                    <p className="mt-2 text-sm text-foreground-secondary mb-2">OR</p>
                    <input
                      type="url"
                      value={chapterFormData.video_url}
                      onChange={(e) => {
                        setChapterFormData({ ...chapterFormData, video_url: e.target.value });
                        setVideoFile(null);
                      }}
                      placeholder="Enter video URL"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Video URL *
                </label>
                <input
                  type="url"
                  required
                  value={chapterFormData.video_url}
                  onChange={(e) => setChapterFormData({ ...chapterFormData, video_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="https://example.com/video.mp4"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={chapterFormData.display_order}
                  onChange={(e) => setChapterFormData({ ...chapterFormData, display_order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Pass Percentage (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={chapterFormData.pass_percentage}
                  onChange={(e) => setChapterFormData({ ...chapterFormData, pass_percentage: parseInt(e.target.value) || 70 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="70"
                />
                <p className="text-xs text-foreground-secondary mt-1">
                  Minimum percentage of correct answers required to pass this chapter (0-100)
                </p>
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
                  onClick={() => setShowChapterModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

