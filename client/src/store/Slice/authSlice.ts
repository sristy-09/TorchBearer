import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import type {
  AuthState,
  LoginFormType,
  SignUpFormType,
  User,
} from "../../feature/Auth/types/types";

const API_URL = import.meta.env.VITE_API_URL;

// Create a dedicated axios instance for authenticated requests
// This prevents global state pollution across users
export const apiClient = axios.create({
  baseURL: API_URL,
});

// Add request interceptor to attach token from localStorage on each request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle 401 errors (invalid/expired tokens)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired - clear it
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ── Async thunks ─────────────────────────────────────────────

export const loginUser = createAsyncThunk(
  "auth/login",
  async (data: LoginFormType, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/api/auth/login", data);
      return res.data; // { success, token, data: { user } }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data?.message || "Login failed");
      }
      return rejectWithValue("Login failed");
    }
  },
);

export const loginAdmin = createAsyncThunk(
  "auth/loginAdmin",
  async (data: LoginFormType, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/api/auth/login", data);

      // Verify the user is an admin
      if (res.data.data.user.role !== "admin") {
        return rejectWithValue("Access denied. Admin credentials required.");
      }

      return res.data; // { success, token, data: { user } }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data?.message || "Login failed");
      }
      return rejectWithValue("Login failed");
    }
  },
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (data: SignUpFormType, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/api/auth/register", data);
      return res.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(
          err.response?.data?.message || "Registration failed",
        );
      }
      return rejectWithValue("Registration failed");
    }
  },
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchMe",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/api/auth/me");
      return res.data; // { success, data: { user } }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(
          err.response?.data?.message || "Failed to fetch user",
        );
      }
      return rejectWithValue("Failed to fetch user");
    }
  },
);

export const completeUserProfile = createAsyncThunk(
  "auth/completeProfile",
  async (
    data: {
      role: string;
      batchYear?: number;
      registrationNumber?: number;
      department?: string;
      skills?: string[];
      interests?: string[];
    },
    { rejectWithValue },
  ) => {
    try {
      const res = await apiClient.put("/api/auth/complete-profile", data);
      return res.data; // { success, data: { user } }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(
          err.response?.data?.message || "Failed to complete profile",
        );
      }
      return rejectWithValue("Failed to complete profile");
    }
  },
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/api/auth/logout");
      return res.data; // { success, message }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(
          err.response?.data?.message || "Logout failed",
        );
      }
      return rejectWithValue("Logout failed");
    }
  },
);

// ── Slice ─────────────────────────────────────────────────────

// helper — check if user has completed profile
const isProfileComplete = (user: User | null) => !!user?.role;

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: false, // Don't trust token until verified
  isProfileComplete: false,
  loading: !!localStorage.getItem("token"), // Start loading if token exists
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Call this after Google OAuth callback sets token in localStorage
    setTokenFromOAuth(state, action) {
      const token = action.payload as string;
      state.token = token;
      state.isAuthenticated = true;
      localStorage.setItem("token", token);
      // No need to set axios headers - interceptor handles it
    },
    setUser(state, action) {
      state.user = action.payload as User;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isProfileComplete = false;
      state.error = null;
      localStorage.removeItem("token");
      // No need to delete axios headers - interceptor handles it
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.data.user;
        state.isProfileComplete = isProfileComplete(action.payload.data.user);
        state.isAuthenticated = true;
        localStorage.setItem("token", action.payload.token);
        // No need to set axios headers - interceptor handles it
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // admin login
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.data.user;
        state.isProfileComplete = isProfileComplete(action.payload.data.user);
        state.isAuthenticated = true;
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // register
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.data.user;
        state.isProfileComplete = isProfileComplete(action.payload.data.user);
        state.isAuthenticated = true;
        localStorage.setItem("token", action.payload.token);
        // No need to set axios headers - interceptor handles it
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // fetchMe (used after Google OAuth)
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data.user;
        state.isProfileComplete = isProfileComplete(action.payload.data.user);
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        localStorage.removeItem("token");
      });

    // Add completeUserProfile cases:
    builder
      .addCase(completeUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data.user;
        state.isProfileComplete = true;
      })
      .addCase(completeUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isProfileComplete = false;
        state.error = null;
        localStorage.removeItem("token");
      })
      .addCase(logoutUser.rejected, (state) => {
        // Even if API call fails, clear local state
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isProfileComplete = false;
        state.error = null;
        localStorage.removeItem("token");
      });
  },
});

export const { setTokenFromOAuth, setUser, logout, clearError } =
  authSlice.actions;
export default authSlice.reducer;
