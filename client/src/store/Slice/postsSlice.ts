import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Post } from "../../feature/Post/types/post";
import { apiClient } from "./authSlice";

interface PostsState {
  posts: Post[];
  loading: boolean;
  error: string | null;
  currentTopicId: string | null;
}

const initialState: PostsState = {
  posts: [],
  loading: false,
  error: null,
  currentTopicId: null,
};

export const fetchPostsByTopic = createAsyncThunk(
  "posts/fetchPostsByTopic",
  async (topicId: string, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/api/posts?topic=${topicId}`);
      return { posts: res.data.data, topicId };
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
      const res = await apiClient.post(`/api/posts/${postId}/like`);
      return { postId, liked: res.data.liked, likesCount: res.data.likesCount };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to like post"
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
        const post = state.posts.find((p) => p._id === action.payload.postId);
        if (post) {
          // Update likes count based on server response
          if (action.payload.liked) {
            // User liked the post - add placeholder if needed
            post.likes = Array(action.payload.likesCount).fill("");
          } else {
            // User unliked - reduce count
            post.likes = Array(action.payload.likesCount).fill("");
          }
        }
      });
  },
});

export const { clearPosts } = postsSlice.actions;
export default postsSlice.reducer;
