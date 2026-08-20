// ============================================================
// DealHive — Redux Toolkit Store
// src/store/slices/index.ts
// ============================================================

import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import authReducer from './authSlice';
import cartReducer from './cartSlice';
import dealsReducer from './dealsSlice';
import notificationsReducer from './notificationsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    deals: dealsReducer,
    notifications: notificationsReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
