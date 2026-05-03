import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Topic } from "../../feature/Topic/types/topic";
import { apiClient } from "./authSlice";

interface TopicsState {
  topics: Topic[];
  loading: boolean;
  error: string | null;
  currentSpaceId: string | null;
  searchQuery: string;
  sortBy: "latest" | "name";
}

const initialState: TopicsState = {
  topics: [],
  loading: false,
  error: null,
  currentSpaceId: null,
  searchQuery: "",
  sortBy: "latest",
};

export const fetchTopicsBySpace = createAsyncThunk(
  "topics/fetchTopicsBySpace",
  async (
    params: { spaceId: string; keyword?: string; page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("space", params.spaceId);

      if (params.keyword) {
        queryParams.append("keyword", params.keyword);
      }
      if (params.page) {
        queryParams.append("page", params.page.toString());
      }
      if (params.limit) {
        queryParams.append("limit", params.limit.toString());
      }

      const res = await apiClient.get(`/api/topics?${queryParams.toString()}`);
      return { topics: res.data.data, spaceId: params.spaceId };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch topics"
      );
    }
  }
);

export const createTopic = createAsyncThunk(
  "topics/createTopic",
  async (
    data: {
      title: string;
      description: string;
      spaceId: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.post("/api/topics", data);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to create topic"
      );
    }
  }
);

const topicsSlice = createSlice({
  name: "topics",
  initialState,
  reducers: {
    clearTopics: (state) => {
      state.topics = [];
      state.currentSpaceId = null;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchTopicsBySpace.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchTopicsBySpace.fulfilled, (state, action) => {
        state.loading = false;
        state.topics = action.payload.topics;
        state.currentSpaceId = action.payload.spaceId;
      })

      .addCase(fetchTopicsBySpace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(createTopic.fulfilled, (state, action) => {
        state.topics.unshift(action.payload);
      });
  },
});

export const { clearTopics, setSearchQuery, setSortBy } = topicsSlice.actions;
export default topicsSlice.reducer;
