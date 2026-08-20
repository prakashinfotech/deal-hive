'use client';

import { useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAppDispatch, useAppSelector } from '@/store';
import { addRealtimeNotification } from '@/store/slices/notificationsSlice';
import { selectIsAuthenticated } from '@/store/slices/authSlice';

const SIGNALR_URL = process.env.NEXT_PUBLIC_SIGNALR_URL ?? 'http://localhost:5000';

export function useSignalR() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      connectionRef.current?.stop();
      connectionRef.current = null;
      return;
    }

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${SIGNALR_URL}/hubs/notifications`, {
        accessTokenFactory: () => {
          // Access token stored in Redux auth state (in-memory, not localStorage)
          return (window as any).__redux_access_token__ ?? '';
        },
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connection.on('ReceiveNotification', (notification) => {
      dispatch(addRealtimeNotification(notification));
    });

    connection
      .start()
      .catch((err) => console.warn('SignalR connection failed:', err));

    connectionRef.current = connection;

    return () => {
      connection.stop();
    };
  }, [isAuthenticated, dispatch]);

  return connectionRef.current;
}
