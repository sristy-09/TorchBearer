import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Post } from "../../feature/Post/types/post";
import { apiClient } from "./authSlice";
interface PostsState {
  posts: Post[];
  loading: boolean;
  error: string | null;
  currentTopicId: string | null;
  searchQuery: string;
  sortBy: "latest" | "popular";
}

const initialState: PostsState = {
  posts: [],
  loading: false,
  error: null,
  currentTopicId: null,
  searchQuery: "",
  sortBy: "latest",
};

export const fetchPostsByTopic = createAsyncThunk(
  "posts/fetchPostsByTopic",
  async (
    params: { topicId: string; keyword?: string; page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("topic", params.topicId);

      if (params.keyword) queryParams.append("keyword", params.keyword);
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());

      const res = await apiClient.get(`/api/posts?${queryParams.toString()}`);

      return { posts: res.data.data, topicId: params.topicId };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch posts"
      );
    }
  }
);

export const createPost = createAsyncThunk(
  "posts/createPost",
  async (
    data: {
      title: string;
      content: string;
      description?: string;
      image?: string;
      topicId: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.post("/api/posts", data);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to create post"
      );
    }
  }
);

export const likePost = createAsyncThunk(
  "posts/likePost",
  async (postId: string, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(`/api/posts/${postId}/like`);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to like post"
      );
    }
  }
);

export const addComment = createAsyncThunk(
  "posts/addComment",
  async (
    { postId, text }: { postId: string; text: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.post(`/api/posts/${postId}/comment`, {
        text,
      });

      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to add comment"
      );
    }
  }
);

export const updatePost = createAsyncThunk(
  "posts/updatePost",
  async (
    { id, data }: { id: string; data: { title: string; content: string } },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.put(`/api/posts/${id}`, data);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update post"
      );
    }
  }
);

export const deletePost = createAsyncThunk(
  "posts/deletePost",
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/api/posts/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete post"
      );
    }
  }
);

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    clearPosts: (state) => {
      state.posts = [];
      state.currentTopicId = null;
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
      .addCase(fetchPostsByTopic.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPostsByTopic.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload.posts;
        state.currentTopicId = action.payload.topicId;
      })
      .addCase(fetchPostsByTopic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(createPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload);
      })

      .addCase(likePost.fulfilled, (state, action) => {
        const updatedPost = action.payload;

        const index = state.posts.findIndex(
          (p) => p._id === updatedPost._id
        );

        if (index !== -1) {
          state.posts[index] = {
            ...state.posts[index],
            ...updatedPost,
          };
        }
      })

      .addCase(addComment.fulfilled, (state, action) => {
        const updatedPost = action.payload;

        const index = state.posts.findIndex(
          (p) => p._id === updatedPost._id
        );

        if (index !== -1) {
          state.posts[index] = {
            ...state.posts[index],
            ...updatedPost,
          };
        }
      })

      .addCase(updatePost.fulfilled, (state, action) => {
        const index = state.posts.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.posts[index] = {
            ...state.posts[index],
            ...action.payload,
          };
        }
      })

      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter((p) => p._id !== action.payload);
      });
  },
});

export const { clearPosts, setSearchQuery, setSortBy } = postsSlice.actions;
export default postsSlice.reducer;