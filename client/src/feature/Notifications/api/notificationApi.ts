import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: `${API_URL}/api/notifications`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface NotificationData {
  _id: string;
  type: "space_join_request" | "space_join_approved" | "space_join_rejected";
  from: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
    department?: string;
    batchYear?: number;
    registrationNumber?: number;
  };
  to: string;
  space: {
    _id: string;
    title: string;
    description: string;
  };
  message: string;
  isRead: boolean;
  status: "pending" | "approved" | "rejected";
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  success: boolean;
  data: {
    notifications: NotificationData[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    unreadCount: number;
  };
}

export interface PendingRequestsResponse {
  success: boolean;
  data: {
    requests: NotificationData[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

// Request to join a space
export const requestToJoinSpace = async (spaceId: string) => {
  const response = await api.post(`/request-join/${spaceId}`);
  return response.data;
};

// Get user notifications
export const getUserNotifications = async (params?: {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}) => {
  const response = await api.get<NotificationResponse>("/", { params });
  return response.data;
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string) => {
  const response = await api.patch(`/${notificationId}/read`);
  return response.data;
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  const response = await api.patch("/read-all");
  return response.data;
};

// Get pending join requests (Admin only)
export const getPendingJoinRequests = async (params?: {
  page?: number;
  limit?: number;
}) => {
  const response = await api.get<PendingRequestsResponse>("/pending-requests", { params });
  return response.data;
};

// Approve join request (Admin only)
export const approveJoinRequest = async (notificationId: string) => {
  const response = await api.patch(`/${notificationId}/approve`);
  return response.data;
};

// Reject join request (Admin only)
export const rejectJoinRequest = async (
  notificationId: string,
  reason?: string
) => {
  const response = await api.patch(`/${notificationId}/reject`, { reason });
  return response.data;
};
