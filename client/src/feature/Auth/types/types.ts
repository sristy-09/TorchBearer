export interface LoginFormType {
  email: string;
  password: string;
}

export interface SignUpFormType {
  name: string;
  email: string;
  password: string;
}

export type FormErrors = {
  name?: string;
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
  isProfileComplete: boolean;
  loading: boolean;
  error: string | null;
}

export interface CompleteProfileFormType {
  role: "student" | "alumni" | "";
  batchYear: string;
  registrationNumber: string;
  department: string;
  skills: string[];
  interests: string[];
}

export type CompleteProfileErrors = {
  role?: string;
  batchYear?: string;
  registrationNumber?: string;
  department?: string;
  skills?: string;
  interests?: string;
};
