import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/lib/api';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsState {
  items: Notification[];
  unreadCount: number;
  isLoading: boolean;
}

const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
  isLoading: false,
};

export const fetchNotifications = createAsyncThunk<Notification[]>(
  'notifications/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<Notification[]>('/users/me/notifications');
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const markNotificationRead = createAsyncThunk<string, string>(
  'notifications/markRead',
  async (id, { rejectWithValue }) => {
    try {
      await api.put(`/users/me/notifications/${id}/read`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const markAllRead = createAsyncThunk('notifications/markAllRead', async () => {
  await api.put('/users/me/notifications/read-all');
});

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addRealtimeNotification(state, action: PayloadAction<Notification>) {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => { state.isLoading = true; })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.unreadCount = action.payload.filter((n) => !n.isRead).length;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const n = state.items.find((n) => n.id === action.payload);
        if (n && !n.isRead) { n.isRead = true; state.unreadCount = Math.max(0, state.unreadCount - 1); }
      })
      .addCase(markAllRead.fulfilled, (state) => {
        state.items.forEach((n) => (n.isRead = true));
        state.unreadCount = 0;
      });
  },
});

export const { addRealtimeNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;

export const selectNotifications = (state: { notifications: NotificationsState }) => state.notifications.items;
export const selectUnreadCount = (state: { notifications: NotificationsState }) => state.notifications.unreadCount;
