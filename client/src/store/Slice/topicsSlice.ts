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

export const fetchAllTopics = createAsyncThunk(
  "topics/fetchAllTopics",
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
      const url = `/api/topics${queryString ? `?${queryString}` : ""}`;

      const res = await apiClient.get(url);
      return res.data.data;
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

export const updateTopic = createAsyncThunk(
  "topics/updateTopic",
  async (
    { id, data }: { id: string; data: { title: string; description: string } },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.put(`/api/topics/${id}`, data);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update topic"
      );
    }
  }
);

export const deleteTopic = createAsyncThunk(
  "topics/deleteTopic",
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/api/topics/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete topic"
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

      .addCase(fetchAllTopics.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchAllTopics.fulfilled, (state, action) => {
        state.loading = false;
        state.topics = action.payload;
        state.currentSpaceId = null;
      })

      .addCase(fetchAllTopics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(createTopic.fulfilled, (state, action) => {
        state.topics.unshift(action.payload);
      })

      .addCase(updateTopic.fulfilled, (state, action) => {
        const index = state.topics.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) {
          state.topics[index] = action.payload;
        }
      })

      .addCase(deleteTopic.fulfilled, (state, action) => {
        state.topics = state.topics.filter((t) => t._id !== action.payload);
      });
  },
});

export const { clearTopics, setSearchQuery, setSortBy } = topicsSlice.actions;
export default topicsSlice.reducer;
