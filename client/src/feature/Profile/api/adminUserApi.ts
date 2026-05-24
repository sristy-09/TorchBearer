import { apiClient } from "../../../store/Slice/authSlice";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "student" | "alumni";
  avatar?: string;
  department?: string;
  batchYear?: number;
  registrationNumber?: number;
  skills?: string[];
  interests?: string[];
  createdAt: string;
}

export interface FetchUsersParams {
  keyword?: string;
  role?: string;
  department?: string;
  batchYear?: string;
}

export const fetchAllUsers = async (params: FetchUsersParams = {}) => {
  const queryParams = new URLSearchParams();

  if (params.keyword) {
    queryParams.append("keyword", params.keyword);
  }
  if (params.role) {
    queryParams.append("role", params.role);
  }
  if (params.department) {
    queryParams.append("department", params.department);
  }
  if (params.batchYear) {
    queryParams.append("batchYear", params.batchYear);
  }

  const queryString = queryParams.toString();
  const url = `/api/auth/users${queryString ? `?${queryString}` : ""}`;

  const res = await apiClient.get(url);
  return res.data.data.users;
};
