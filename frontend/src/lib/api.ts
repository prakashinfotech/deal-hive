// ============================================================
// DealHive — Axios API Client with JWT Interceptors
// src/lib/api.ts
// ============================================================

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { store } from '@/store';
import { logout, setAccessToken } from '@/store/slices/authSlice';
import type { AuthResponse } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

// ─── Main API instance ───────────────────────────────────────
export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // sends HttpOnly refresh token cookie
});

// ─── Request interceptor: attach access token ────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = store.getState().auth.accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor: auto-refresh on 401 ───────────────
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post<Pick<AuthResponse, 'accessToken' | 'expiresIn'>>(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        store.dispatch(setAccessToken(data.accessToken));
        onTokenRefreshed(data.accessToken);
        isRefreshing = false;

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        }
        return api(originalRequest);
      } catch {
        isRefreshing = false;
        store.dispatch(logout());
        // Use replace so back button doesn't loop back to the failed page
        if (typeof window !== 'undefined') {
          window.location.replace('/login');
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// ─── Public (unauthenticated) API instance ───────────────────
export const publicApi = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export default api;
