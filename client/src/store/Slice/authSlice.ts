import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import type {
  AuthState,
  LoginFormType,
  SignUpFormType,
  User,
} from "../../feature/Auth/types/types";

const API_URL = import.meta.env.VITE_API_URL;

const token = localStorage.getItem("token");
if (token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

// ── Async thunks ─────────────────────────────────────────────

export const loginUser = createAsyncThunk(
  "auth/login",
  async (data: LoginFormType, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, data);
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
      const res = await axios.post(`${API_URL}/api/auth/register`, data);
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
      const res = await axios.get(`${API_URL}/api/auth/me`);
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

// ── Slice ─────────────────────────────────────────────────────

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: !!localStorage.getItem("token"),
  loading: false,
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
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    },
    setUser(state, action) {
      state.user = action.payload as User;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
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
        state.isAuthenticated = true;
        localStorage.setItem("token", action.payload.token);
        axios.defaults.headers.common["Authorization"] =
          `Bearer ${action.payload.token}`;
      })
      .addCase(loginUser.rejected, (state, action) => {
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
        state.isAuthenticated = true;
        localStorage.setItem("token", action.payload.token);
        axios.defaults.headers.common["Authorization"] =
          `Bearer ${action.payload.token}`;
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
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        localStorage.removeItem("token");
      });
  },
});

export const { setTokenFromOAuth, setUser, logout, clearError } =
  authSlice.actions;
export default authSlice.reducer;
