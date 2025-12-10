/* eslint-disable @typescript-eslint/no-explicit-any */
// API responses from backend may vary, so we use 'any' for flexibility
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Don't access localStorage during initialization to avoid SSR issues
    // Token will be set via setToken() after component mounts
  }

  setToken(token: string | null) {
    this.token = token;
    if (token && typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    } else if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Ensure token is loaded from localStorage if not set
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: 'An error occurred' };
      }
      
      // Handle 401 Unauthorized specifically
      if (response.status === 401) {
        // Clear token if unauthorized
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          this.token = null;
        }
        throw new Error(errorData.message || 'Unauthenticated. Please login again.');
      }
      
      // Create error with response data attached for special handling
      const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
      (error as any).response = errorData;
      (error as any).status = response.status;
      throw error;
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async upload<T>(endpoint: string, formData: FormData, method: 'POST' | 'PUT' = 'POST'): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    // Ensure token is loaded from localStorage if not set
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // For PUT requests with FormData, use both method spoofing approaches
    if (method === 'PUT') {
      formData.append('_method', 'PUT');
      headers['X-HTTP-Method-Override'] = 'PUT';
    }

    const response = await fetch(url, {
      method: 'POST', // Always use POST for FormData, Laravel will handle method spoofing
      headers,
      body: formData,
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: 'An error occurred' };
      }
      
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          this.token = null;
        }
        throw new Error(errorData.message || 'Unauthenticated. Please login again.');
      }
      
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Auth API
export const authApi = {
  register: (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    company?: string;
    vantage_card_number?: string;
  }) => apiClient.post<{ user: any; token: string }>('/auth/register', data),
  login: (data: {
    email: string;
    password: string;
  }) => apiClient.post<{ user: any; token: string }>('/auth/login', data),
  adminLogin: (data: {
    email: string;
    password: string;
  }) => apiClient.post<{ user: any; token: string }>('/auth/admin/login', data),
  me: () => apiClient.get<any>('/auth/me'),
  logout: () => apiClient.post<{ message: string }>('/auth/logout'),
};

// User API
export const inductionApi = {
  getActive: () => apiClient.get<any[]>('/inductions/active'),
  getCompleted: (inductionId: number) =>
    apiClient.get<any>(`/inductions/${inductionId}/completed`),
  start: (inductionId: number) =>
    apiClient.post<any>(`/inductions/${inductionId}/start`),
};

export interface SubmitAnswersResponse {
  message: string;
  all_questions_answered: boolean;
  status: string;
  last_unanswered_chapter?: {
    id: number;
    title: string;
    display_order: number;
  } | null;
}

export const submissionApi = {
  get: (submissionId: number) =>
    apiClient.get<any>(`/submissions/${submissionId}`),
  getLastUnanswered: (submissionId: number) =>
    apiClient.get<any>(`/submissions/${submissionId}/last-unanswered`),
  submitAnswers: (submissionId: number, chapterId: number, answers: any[]) =>
    apiClient.post<SubmitAnswersResponse>(`/submissions/${submissionId}/answers`, { chapter_id: chapterId, answers }),
  complete: (submissionId: number) =>
    apiClient.post(`/submissions/${submissionId}/complete`),
};

// Admin API
export const adminInductionApi = {
  list: () => apiClient.get<any[]>('/admin/inductions'),
  create: (data: any) => apiClient.post('/admin/inductions', data),
  update: (id: number, data: any) =>
    apiClient.put(`/admin/inductions/${id}`, data),
  delete: (id: number) => apiClient.delete(`/admin/inductions/${id}`),
  reorder: (id: number, displayOrder: number) =>
    apiClient.post(`/admin/inductions/${id}/reorder`, { display_order: displayOrder }),
  importCsv: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.upload(`/admin/inductions/import`, formData, 'POST');
  },
};

export const adminChapterApi = {
  list: (inductionId: number) =>
    apiClient.get<any[]>(`/admin/inductions/${inductionId}/chapters`),
  create: (inductionId: number, data: FormData) =>
    apiClient.upload(`/admin/inductions/${inductionId}/chapters`, data, 'POST'),
  update: (id: number, data: FormData) =>
    apiClient.upload(`/admin/chapters/${id}`, data, 'PUT'),
  delete: (id: number) => apiClient.delete(`/admin/chapters/${id}`),
  reorder: (id: number, displayOrder: number) =>
    apiClient.post(`/admin/chapters/${id}/reorder`, { display_order: displayOrder }),
};

export const adminQuestionApi = {
  list: (chapterId: number) =>
    apiClient.get<any[]>(`/admin/chapters/${chapterId}/questions`),
  create: (chapterId: number, data: any) =>
    apiClient.post(`/admin/chapters/${chapterId}/questions`, data),
  update: (id: number, data: any) =>
    apiClient.put(`/admin/questions/${id}`, data),
  delete: (id: number) => apiClient.delete(`/admin/questions/${id}`),
  reorder: (id: number, displayOrder: number) =>
    apiClient.post(`/admin/questions/${id}/reorder`, { display_order: displayOrder }),
};

export const adminSubmissionApi = {
  list: (filters?: any) => {
    const params = new URLSearchParams(filters).toString();
    return apiClient.get<any>(`/admin/submissions${params ? `?${params}` : ''}`);
  },
  get: (id: number) => apiClient.get<any>(`/admin/submissions/${id}`),
};

export const adminApi = {
  list: () => apiClient.get<any[]>('/admin/admins'),
  create: (data: any) => apiClient.post('/admin/admins', data),
  update: (id: number, data: any) => apiClient.put(`/admin/admins/${id}`, data),
  delete: (id: number) => apiClient.delete(`/admin/admins/${id}`),
};

// Video completion API
export interface VideoCompletionResponse {
  is_completed: boolean;
  progress_percentage: number;
  completion?: any | null;
}

export const videoCompletionApi = {
  updateProgress: (chapterId: number, data: {
    submission_id: number;
    progress_percentage: number;
    watched_seconds: number;
    total_seconds?: number;
  }) => apiClient.post(`/chapters/${chapterId}/video/progress`, data),
  markCompleted: (chapterId: number, data: {
    submission_id: number;
    total_seconds?: number;
  }) => apiClient.post(`/chapters/${chapterId}/video/complete`, data),
  checkCompletion: (chapterId: number, submissionId: number) =>
    apiClient.get<VideoCompletionResponse>(`/chapters/${chapterId}/video/completion?submission_id=${submissionId}`),
};

// User progress API
export const userProgressApi = {
  getAll: () => apiClient.get<any[]>('/progress'),
  getSubmission: (submissionId: number) => apiClient.get<any>(`/progress/submissions/${submissionId}`),
};

