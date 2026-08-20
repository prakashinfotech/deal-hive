'use client';

import { ReactNode, useEffect } from 'react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { store } from '@/store';
import { useAppDispatch } from '@/store';
import { restoreSession } from '@/store/slices/authSlice';
import { useSignalR } from '@/hooks/useSignalR';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 1 },
  },
});

/** Restores session from the HttpOnly refresh-token cookie on every page load. */
function SessionRestorer() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(restoreSession());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

/** Inner component that has access to Redux store for hooks */
function AppServices({ children }: { children: ReactNode }) {
  useSignalR(); // Connects/disconnects SignalR based on auth state
  return <>{children}</>;
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <SessionRestorer />
        <AppServices>
          {children}
        </AppServices>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      </QueryClientProvider>
    </Provider>
  );
}
