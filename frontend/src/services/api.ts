// src/services/api.ts
import axios from 'axios';
import type { AuthResponse, Printer, PrintJob, User } from '../types';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ||
  (import.meta.env.DEV ? '/api' : '/printer/api');

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

const normalizeRole = (user: Record<string, unknown>) => {
  if (typeof user.role === 'string') {
    return user.role.toLowerCase();
  }

  if (typeof user.role === 'number') {
    return user.role === 1 ? 'admin' : 'user';
  }

  if (Array.isArray(user.roles)) {
    const normalizedRoles = user.roles
      .map((value) => (typeof value === 'string' ? value.toLowerCase() : ''))
      .filter(Boolean);

    if (normalizedRoles.some((value) => value.includes('admin'))) {
      return 'admin';
    }

    if (normalizedRoles.length > 0) {
      return normalizedRoles[0];
    }
  }

  if (typeof user.user_role === 'string') {
    return user.user_role.toLowerCase();
  }

  if (typeof user.role_name === 'string') {
    return user.role_name.toLowerCase();
  }

  if (typeof user.isAdmin === 'boolean') {
    return user.isAdmin ? 'admin' : 'user';
  }

  return undefined;
};

export const normalizeUser = (rawUser: unknown) => {
  if (!rawUser || typeof rawUser !== 'object') {
    return null;
  }

  const user = rawUser as Record<string, unknown>;
  const normalizedRole = normalizeRole(user);
  const normalized: Record<string, unknown> = {
    ...user,
    role: normalizedRole ?? 'user',
  };

  if (typeof user.firstName !== 'string' && typeof user.first_name === 'string') {
    normalized.firstName = user.first_name;
  }

  if (typeof user.lastName !== 'string' && typeof user.last_name === 'string') {
    normalized.lastName = user.last_name;
  }

  return normalized;
};

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearAuthSession();
    }

    return Promise.reject(error);
  },
);

export const persistAuthSession = (responseData: AuthResponse) => {
  if (typeof window === 'undefined') {
    return;
  }

  const rawData = responseData as AuthResponse & Record<string, unknown>;
  const nested = rawData.data && typeof rawData.data === 'object' ? (rawData.data as Record<string, unknown>) : null;
  const authPayload = {
    success: rawData.success ?? (nested?.success as boolean | undefined) ?? true,
    message: (rawData.message ?? nested?.message) as string | undefined,
    token: (rawData.token ?? nested?.token) as string | undefined,
    user: rawData.user ?? nested?.user,
    userId: (rawData.userId ?? nested?.userId) as string | undefined,
  };

  const normalizedUser = normalizeUser(authPayload.user);
  const payload = {
    success: authPayload.success,
    message: authPayload.message,
    token: authPayload.token,
    user: normalizedUser,
    userId: authPayload.userId,
  };

  window.localStorage.setItem('authSession', JSON.stringify(payload));

  if (authPayload.token) {
    window.localStorage.setItem('token', authPayload.token);
  }

  if (normalizedUser) {
    window.localStorage.setItem('user', JSON.stringify(normalizedUser));
  }

  if (authPayload.userId) {
    window.localStorage.setItem('userId', authPayload.userId);
  }
};

export const clearAuthSession = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem('authSession');
  window.localStorage.removeItem('token');
  window.localStorage.removeItem('user');
  window.localStorage.removeItem('userId');
};

export const getApiErrorMessage = (err: unknown) => {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) {
      return response.data.message;
    }
    if (typeof response?.data === 'string' && response.data) {
      return response.data;
    }
  }

  if (err instanceof Error) {
    return err.message;
  }

  return 'Something went wrong. Please try again.';
};

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = LoginPayload & {
  firstName: string;
  lastName: string;
  phone:string;
  password:string
};

type ProfileUpdatePayload = Partial<Pick<User, 'firstName' | 'lastName' | 'department'>>;

type ChangePasswordPayload = {
  oldPassword: string;
  newPassword: string;
};

type PrinterStatusUpdatePayload = {
  status: 'active' | 'inactive' | 'offline' | 'maintenance';
  reason?: string;
};

type PrinterCreatePayload = {
  name: string;
  location: string;
  ipAddress: string;
  agentId: string;
};

type PrintJobPayload = {
  printerId: string;
  fileId: string;
  copies: number;
  colorMode: 'color' | 'bw' | 'grayscale';
  pageRange?: string;
  paperSize?: string;
  orientation?: 'portrait' | 'landscape';
  priority?: 'low' | 'normal' | 'high';
  doubleSided?: boolean;
  notes?: string;
};

type FileListQuery = {
  sort?: 'uploadedAt' | 'fileName' | 'fileSize';
  limit?: number;
  offset?: number;
};

type AdminUserQuery = {
  department?: string;
  status?: 'active' | 'inactive';
  limit?: number;
};

type ReportQuery = {
  startDate?: string;
  endDate?: string;
  printer?: string;
};

export const apiService = {
  auth: {
    register: (payload: RegisterPayload) => api.post<AuthResponse>('/auth/signup', payload),
    login: (payload: LoginPayload) => api.post<AuthResponse>('/auth/signin', payload),
    getProfile: () => api.get<{ success: boolean; user: User }>('/users/profile'),
    updateProfile: (payload: ProfileUpdatePayload) =>
      api.put<{ success: boolean; message: string; user: User }>('/users/profile', payload),
    changePassword: (payload: ChangePasswordPayload) =>
      api.post<{ success: boolean; message: string }>('/users/change-password', payload),
  },

  printers: {
    list: (params?: { status?: string; location?: string }) =>
      api.get<{ success: boolean; count: number; printers: Printer[] }>('/printers', { params }),
    get: (printerId: string) => api.get<{ success: boolean; printer: Printer }>(`/printers/${printerId}`),
    create: (payload: PrinterCreatePayload) =>
      api.post<{ success: boolean; message: string; printer: Printer }>('/printers', payload),
    updateStatus: (printerId: string, payload: PrinterStatusUpdatePayload) =>
      api.patch<{ success: boolean; message: string }>(`/printers/${printerId}/status`, payload),
  },

  printJobs: {
    create: (payload: PrintJobPayload) =>
      api.post<{ success: boolean; message: string; jobId: string; estimatedTime?: string; status?: PrintJob['status'] }>('/print-jobs', payload),
    list: (params?: { status?: string; printer?: string; startDate?: string; endDate?: string }) =>
      api.get<{ success: boolean; count: number; jobs: PrintJob[] }>('/print-jobs', { params }),
    get: (jobId: string) => api.get<{ success: boolean; job: PrintJob }>(`/print-jobs/${jobId}`),
    cancel: (jobId: string) => api.delete<{ success: boolean; message: string }>(`/print-jobs/${jobId}`),
    pause: (jobId: string) => api.patch<{ success: boolean; message: string }>(`/print-jobs/${jobId}/pause`),
    resume: (jobId: string) => api.patch<{ success: boolean; message: string }>(`/print-jobs/${jobId}/resume`),
  },

  files: {
    upload: (formData: FormData) =>
      api.post<{
        success: boolean;
        message: string;
        fileId: string;
        fileName: string;
        fileSize: number;
        uploadedAt: string;
        fileUrl: string;
      }>('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
    list: (params?: FileListQuery) =>
      api.get<{ success: boolean; count: number; files: Array<Record<string, unknown>> }>('/files', { params }),
    get: (fileId: string) => api.get<{ success: boolean; file: Record<string, unknown> }>(`/files/${fileId}`),
    delete: (fileId: string) => api.delete<{ success: boolean; message: string }>(`/files/${fileId}`),
    download: (fileId: string) => api.get(`/files/download/${fileId}`, { responseType: 'blob' }),
  },

  admin: {
    getDashboardStats: () => api.get<{ success: boolean; statistics: Record<string, unknown> }>('/admin/dashboard'),
    getAllUsers: (params?: AdminUserQuery) =>
      api.get<{ success: boolean; message: string; data: User[] }>('/admin/user', { params }),
    deactivateUser: (userId: string, payload?: { reason?: string }) =>
      api.patch<{ success: boolean; message: string }>(`/admin/users/${userId}/deactivate`, payload),
    getPrintJobReports: (params?: ReportQuery) =>
      api.get<{ success: boolean; report: Record<string, unknown> }>('/admin/reports/print-jobs', { params }),
    getSystemSettings: () => api.get<{ success: boolean; settings: Record<string, unknown> }>('/admin/settings'),
    updateSystemSettings: (payload: Record<string, unknown>) =>
      api.put<{ success: boolean; message: string }>('/admin/settings', payload),
  },
};
