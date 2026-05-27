import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: `${API_URL}/api/admin`,
  withCredentials: true,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface AdminStats {
  totalUsers: number;
  totalSpaces: number;
  totalTopics: number;
  totalPosts: number;
  roleBreakdown: {
    admin: number;
    student: number;
    alumni: number;
  };
}

export interface AdminStatsResponse {
  success: boolean;
  data: AdminStats;
}

// Get admin dashboard stats
export const getAdminStats = async () => {
  const response = await api.get<AdminStatsResponse>("/stats");
  return response.data;
};
