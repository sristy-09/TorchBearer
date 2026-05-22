import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import * as notificationApi from "../../feature/Notifications/api/notificationApi";
import type { NotificationData } from "../../feature/Notifications/api/notificationApi";

interface NotificationState {
  notifications: NotificationData[];
  pendingRequests: NotificationData[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const initialState: NotificationState = {
  notifications: [],
  pendingRequests: [],
  unreadCount: 0,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
};

// Async thunks
export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (params?: { page?: number; limit?: number; unreadOnly?: boolean }) => {
    const response = await notificationApi.getUserNotifications(params);
    return response.data;
  }
);

export const fetchPendingRequests = createAsyncThunk(
  "notifications/fetchPendingRequests",
  async (params?: { page?: number; limit?: number }) => {
    const response = await notificationApi.getPendingJoinRequests(params);
    return response.data;
  }
);

export const requestJoinSpace = createAsyncThunk(
  "notifications/requestJoinSpace",
  async (spaceId: string, { rejectWithValue }) => {
    try {
      const response = await notificationApi.requestToJoinSpace(spaceId);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to send join request"
      );
    }
  }
);

export const approveRequest = createAsyncThunk(
  "notifications/approveRequest",
  async (notificationId: string, { rejectWithValue }) => {
    try {
      const response = await notificationApi.approveJoinRequest(notificationId);
      return { notificationId, response };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to approve request"
      );
    }
  }
);

export const rejectRequest = createAsyncThunk(
  "notifications/rejectRequest",
  async (
    { notificationId, reason }: { notificationId: string; reason?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await notificationApi.rejectJoinRequest(
        notificationId,
        reason
      );
      return { notificationId, response };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to reject request"
      );
    }
  }
);

export const markAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (notificationId: string) => {
    await notificationApi.markNotificationAsRead(notificationId);
    return notificationId;
  }
);

export const markAllAsRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async () => {
    await notificationApi.markAllNotificationsAsRead();
  }
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<NotificationData>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
    addPendingRequest: (state, action: PayloadAction<NotificationData>) => {
      // Check if request already exists
      const exists = state.pendingRequests.some(
        (req) => req._id === action.payload._id
      );
      if (!exists) {
        state.pendingRequests.unshift(action.payload);
      }
    },
    updateNotificationStatus: (
      state,
      action: PayloadAction<{ notificationId: string; status: string }>
    ) => {
      const { notificationId, status } = action.payload;

      // Update in notifications
      const notification = state.notifications.find(
        (n) => n._id === notificationId
      );
      if (notification) {
        notification.status = status as any;
        notification.isRead = true;
      }

      // Remove from pending requests
      state.pendingRequests = state.pendingRequests.filter(
        (req) => req._id !== notificationId
      );
    },
    decrementUnreadCount: (state) => {
      if (state.unreadCount > 0) {
        state.unreadCount -= 1;
      }
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.pendingRequests = [];
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    // Fetch notifications
    builder.addCase(fetchNotifications.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      state.loading = false;
      state.notifications = action.payload.notifications;
      state.unreadCount = action.payload.unreadCount;
      state.pagination = action.payload.pagination;
    });
    builder.addCase(fetchNotifications.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to fetch notifications";
    });

    // Fetch pending requests
    builder.addCase(fetchPendingRequests.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchPendingRequests.fulfilled, (state, action) => {
      state.loading = false;
      state.pendingRequests = action.payload.requests;
    });
    builder.addCase(fetchPendingRequests.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to fetch pending requests";
    });

    // Request join space
    builder.addCase(requestJoinSpace.fulfilled, (state) => {
      state.error = null;
    });
    builder.addCase(requestJoinSpace.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // Approve request
    builder.addCase(approveRequest.fulfilled, (state, action) => {
      const { notificationId } = action.payload;
      state.pendingRequests = state.pendingRequests.filter(
        (req) => req._id !== notificationId
      );
    });
    builder.addCase(approveRequest.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // Reject request
    builder.addCase(rejectRequest.fulfilled, (state, action) => {
      const { notificationId } = action.payload;
      state.pendingRequests = state.pendingRequests.filter(
        (req) => req._id !== notificationId
      );
    });
    builder.addCase(rejectRequest.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // Mark as read
    builder.addCase(markAsRead.fulfilled, (state, action) => {
      const notification = state.notifications.find(
        (n) => n._id === action.payload
      );
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    });

    // Mark all as read
    builder.addCase(markAllAsRead.fulfilled, (state) => {
      state.notifications.forEach((n) => {
        n.isRead = true;
      });
      state.unreadCount = 0;
    });
  },
});

export const {
  addNotification,
  addPendingRequest,
  updateNotificationStatus,
  decrementUnreadCount,
  clearNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
