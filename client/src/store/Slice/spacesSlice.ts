import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import type { Space } from "../../feature/Spaces/types/space";

const API_URL = import.meta.env.VITE_API_URL;

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
      const res = await axios.get(`${API_URL}/api/spaces`);
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
      const res = await axios.post(`${API_URL}/api/spaces`, data);
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