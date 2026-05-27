import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import * as adminApi from "../../feature/Admin/api/adminApi";
import type { AdminStats } from "../../feature/Admin/api/adminApi";

interface AdminState {
  stats: AdminStats | null;
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  stats: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchAdminStats = createAsyncThunk(
  "admin/fetchStats",
  async () => {
    const response = await adminApi.getAdminStats();
    return response.data;
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch admin stats
      .addCase(fetchAdminStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminStats.fulfilled, (state, action: PayloadAction<AdminStats>) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch admin stats";
      });
  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
