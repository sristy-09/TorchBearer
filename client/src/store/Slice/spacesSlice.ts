import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Space } from "../../feature/Spaces/types/space";
import { apiClient } from "./authSlice";

interface SpacesState {
  spaces: Space[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  filterType: "all" | "my" | "joined";
  sortBy: "latest" | "name";
}

const initialState: SpacesState = {
  spaces: [],
  loading: false,
  error: null,
  searchQuery: "",
  filterType: "all",
  sortBy: "latest",
};

export const fetchSpaces = createAsyncThunk(
  "spaces/fetchSpaces",
  async (params: { keyword?: string; page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();

      if (params.keyword) {
        queryParams.append("keyword", params.keyword);
      }
      if (params.page) {
        queryParams.append("page", params.page.toString());
      }
      if (params.limit) {
        queryParams.append("limit", params.limit.toString());
      }

      const queryString = queryParams.toString();
      const url = `/api/spaces${queryString ? `?${queryString}` : ""}`;

      const res = await apiClient.get(url);
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
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setFilterType: (state, action) => {
      state.filterType = action.payload;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
  },

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

export const { setSearchQuery, setFilterType, setSortBy } = spacesSlice.actions;
export default spacesSlice.reducer;