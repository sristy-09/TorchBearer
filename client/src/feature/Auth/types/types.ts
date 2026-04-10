export interface LoginFormType {
  email: string;
  password: string;
}

export interface SignUpFormType {
  username: string;
  email: string;
  password: string;
}

export type FormErrors = {
  username?: string;
  email?: string;
  password?: string;
};

// Add these:
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
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
