import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Space } from "../../feature/Spaces/types/space";
import { apiClient } from "./authSlice";

interface SpacesState {
  spaces: Space[];
  loading: boolean;
  error: string | null;
}

const initialState: SpacesState = {
  spaces: [],
  loading: false,
  error: null,
};

export const fetchSpaces = createAsyncThunk(
  "spaces/fetchSpaces",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/api/spaces");
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch spaces"
      );
    }
  }
);

export const createSpace = createAsyncThunk(
  "spaces/createSpace",
  async (
    data: {
      title: string;
      description: string
      tags?: string[];
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.post("/api/spaces", data);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to create space"
      );
    }
  }
);

const spacesSlice = createSlice({
  name: "spaces",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchSpaces.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchSpaces.fulfilled, (state, action) => {
        state.loading = false;
        state.spaces = action.payload;
      })

      .addCase(fetchSpaces.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(createSpace.fulfilled, (state, action) => {
        state.spaces.unshift(action.payload);
      });
  },
});

export default spacesSlice.reducer;