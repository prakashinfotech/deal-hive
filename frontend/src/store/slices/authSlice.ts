// ============================================================
// DealHive — Auth Redux Slice
// src/store/slices/authSlice.ts
// ============================================================

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { publicApi, api } from '@/lib/api';
import type { User, AuthResponse, LoginRequest, RegisterRequest } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
  /** True while the initial restoreSession thunk is in-flight on app mount */
  isSessionRestoring: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isLoading: false,
  error: null,
  isSessionRestoring: true, // optimistic: assume there might be a session to restore
};

// ─── Async Thunks ─────────────────────────────────────────────

export const login = createAsyncThunk<AuthResponse, LoginRequest>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await publicApi.post<AuthResponse>('/auth/login', credentials);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail ?? 'Login failed');
    }
  }
);

interface RegisterApiResponse {
  userId: string;
  email: string;
  accessToken: string;
  message: string;
}

export const register = createAsyncThunk<AuthResponse, RegisterRequest>(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await publicApi.post<RegisterApiResponse>('/auth/register', payload);
      // The register endpoint returns a slim response — fetch the full user profile
      // using the returned access token so the auth state is complete.
      const { data: user } = await publicApi.get<AuthResponse['user']>('/users/me', {
        headers: { Authorization: `Bearer ${data.accessToken}` },
      });
      return { accessToken: data.accessToken, expiresIn: 900, user };
    } catch (error: any) {
      const d = error.response?.data;
      const msg =
        (typeof d === 'string' ? d : null) ??
        d?.detail ??
        d?.title ??
        (d?.errors ? Object.values(d.errors).flat().join(' ') : null) ??
        'Registration failed';
      return rejectWithValue(msg);
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await api.post('/auth/logout');
});

export const fetchCurrentUser = createAsyncThunk<User>(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<User>('/users/me');
      return data;
    } catch (error: any) {
      const status = error.response?.status;
      // Only clear session on 401 (token invalid), not on server/network errors
      if (status === 401) return rejectWithValue('Session expired');
      return rejectWithValue(null); // non-auth error: don't change session
    }
  }
);

/**
 * Restores session from the HttpOnly refresh-token cookie on page load.
 * Called once at app mount. Safe to call even when already logged in.
 */
export const restoreSession = createAsyncThunk<
  { accessToken: string; user: User } | null
>('auth/restoreSession', async (_, { getState }) => {
  const state = getState() as { auth: AuthState };
  // Already have a token in memory — nothing to do
  if (state.auth.accessToken) return null;

  try {
    const { data } = await axios.post<Pick<AuthResponse, 'accessToken' | 'expiresIn'>>(
      `${BASE_URL}/auth/refresh`,
      {},
      { withCredentials: true }
    );
    const { data: user } = await axios.get<User>(`${BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${data.accessToken}` },
    });
    return { accessToken: data.accessToken, user };
  } catch {
    return null; // No valid refresh token — stay logged out silently
  }
});

// ─── Slice ────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAccessToken(state, action: PayloadAction<string>) {
      state.accessToken = action.payload;
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(register.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Logout — clear state regardless of whether the API call succeeded
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
      })
      // Fetch current user
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        // Only clear session on explicit 401, not server/network errors
        if (action.payload === 'Session expired') {
          state.user = null;
          state.accessToken = null;
        }
      })
      // Restore session from refresh token cookie
      .addCase(restoreSession.pending, (state) => {
        state.isSessionRestoring = true;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.isSessionRestoring = false;
        if (action.payload) {
          state.accessToken = action.payload.accessToken;
          state.user = action.payload.user;
        }
      })
      .addCase(restoreSession.rejected, (state) => {
        state.isSessionRestoring = false;
      });
  },
});

export const { setAccessToken, logout, clearError } = authSlice.actions;
export default authSlice.reducer;

// ─── Selectors ────────────────────────────────────────────────
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => !!state.auth.accessToken;
export const selectIsSessionRestoring = (state: { auth: AuthState }) => state.auth.isSessionRestoring;
export const selectUserRole = (state: { auth: AuthState }) => state.auth.user?.role;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
