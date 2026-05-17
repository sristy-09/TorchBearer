import { apiClient } from "../../../store/Slice/authSlice";
import type { User } from "../../Auth/types/types";

export const getUserById = async (userId: string): Promise<User> => {
  const res = await apiClient.get(`/api/users/${userId}`);
  return res.data.data.user;
};

export const updateUserProfile = async (data: {
  name?: string;
  department?: string;
  batchYear?: number;
  registrationNumber?: number;
  skills?: string[];
  interests?: string[];
  avatar?: string;
}): Promise<User> => {
  const res = await apiClient.put("/api/users/profile", data);
  return res.data.data.user;
};
