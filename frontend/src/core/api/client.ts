// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/core/api/client.ts
//
// Centralized Axios HTTP client.
//
// ALL API calls in the app must use this client — never create a raw axios
// instance in a feature. This ensures:
//   - The Authorization header is always attached
//   - Token refresh is handled automatically on 401 responses
//   - Request/response logging is consistent
//
// HOW TO USE:
//   import { apiClient } from '@/core/api/client';
//   const response = await apiClient.get('/users');
// ─────────────────────────────────────────────────────────────────────────────

import axios from 'axios';

// Base URL comes from the Vite environment variable (set in .env)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // required for the HttpOnly refresh token cookie
  timeout: 120_000,
});

// ── Request Interceptor ───────────────────────────────────────────────────────
// Attaches the JWT access token to every request automatically.
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response Interceptor ──────────────────────────────────────────────────────
// On 401 (token expired), attempts one automatic token refresh.
// If the refresh also fails, the user is logged out.
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: unknown) => void; reject: (reason?: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Only attempt refresh on 401 and only once per request
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue requests while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        const newToken = data.data?.accessToken;
        localStorage.setItem('accessToken', newToken);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        processQueue(null, newToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Clear auth state and redirect to login
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
