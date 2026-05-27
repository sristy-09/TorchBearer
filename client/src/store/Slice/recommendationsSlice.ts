import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "./authSlice";

/* ─────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────── */

export interface RecommendedSpace {
  id: string;
  title: string;
  description: string;
  tags: string[];
  similarity_score: number;
  created_by: string | null;
}

interface RecommendationsState {
  // Auto recommendations (from user profile on page load)
  autoRecommendations: RecommendedSpace[];
  autoLoading: boolean;
  autoError: string | null;

  // Manual search recommendations
  searchRecommendations: RecommendedSpace[];
  searchLoading: boolean;
  searchError: string | null;
  hasSearched: boolean;

  queryTerms: string[];
  totalSpacesAnalyzed: number;
}

const initialState: RecommendationsState = {
  autoRecommendations: [],
  autoLoading: false,
  autoError: null,

  searchRecommendations: [],
  searchLoading: false,
  searchError: null,
  hasSearched: false,

  queryTerms: [],
  totalSpacesAnalyzed: 0,
};

/* ─────────────────────────────────────────────────────────────
   Thunk: Auto-fetch from user profile (GET /api/recommendations/me)
   Called on HomePage mount — no payload needed, Express reads
   the logged-in user's skills/interests itself.
───────────────────────────────────────────────────────────── */

export const fetchMyRecommendations = createAsyncThunk(
  "recommendations/fetchMine",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/api/recommendations/me");
      return res.data as {
        success: boolean;
        query_terms: string[];
        recommendations: RecommendedSpace[];
        total_spaces_analyzed: number;
      };
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const e = err as { response?: { data?: { message?: string } } };
        return rejectWithValue(e.response?.data?.message || "Failed to load recommendations");
      }
      return rejectWithValue("Failed to load recommendations");
    }
  }
);

/* ─────────────────────────────────────────────────────────────
   Thunk: Manual search (POST /api/recommendations)
   Called when user types skills/interests and hits the button.
───────────────────────────────────────────────────────────── */

export const fetchRecommendations = createAsyncThunk(
  "recommendations/fetchManual",
  async (
    payload: { skills?: string[]; interests?: string[]; top_n?: number },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.post("/api/recommendations", payload);
      return res.data as {
        success: boolean;
        query_terms: string[];
        recommendations: RecommendedSpace[];
        total_spaces_analyzed: number;
      };
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const e = err as { response?: { data?: { message?: string } } };
        return rejectWithValue(e.response?.data?.message || "Failed to fetch recommendations");
      }
      return rejectWithValue("Failed to fetch recommendations");
    }
  }
);

/* ─────────────────────────────────────────────────────────────
   Slice
───────────────────────────────────────────────────────────── */

const recommendationsSlice = createSlice({
  name: "recommendations",
  initialState,
  reducers: {
    clearSearchRecommendations(state) {
      state.searchRecommendations = [];
      state.searchError = null;
      state.hasSearched = false;
      state.queryTerms = [];
      state.totalSpacesAnalyzed = 0;
    },
  },
  extraReducers: (builder) => {
    // ── Auto (profile-based) ──────────────────────────────────
    builder
      .addCase(fetchMyRecommendations.pending, (state) => {
        state.autoLoading = true;
        state.autoError = null;
      })
      .addCase(fetchMyRecommendations.fulfilled, (state, action) => {
        state.autoLoading = false;
        state.autoRecommendations = action.payload.recommendations ?? [];
      })
      .addCase(fetchMyRecommendations.rejected, (state, action) => {
        state.autoLoading = false;
        state.autoError = action.payload as string;
        state.autoRecommendations = [];
      });

    // ── Manual search ─────────────────────────────────────────
    builder
      .addCase(fetchRecommendations.pending, (state) => {
        state.searchLoading = true;
        state.searchError = null;
        state.hasSearched = true;
      })
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchRecommendations = action.payload.recommendations ?? [];
        state.queryTerms = action.payload.query_terms ?? [];
        state.totalSpacesAnalyzed = action.payload.total_spaces_analyzed ?? 0;
      })
      .addCase(fetchRecommendations.rejected, (state, action) => {
        state.searchLoading = false;
        state.searchError = action.payload as string;
        state.searchRecommendations = [];
      });
  },
});

export const { clearSearchRecommendations } = recommendationsSlice.actions;
export default recommendationsSlice.reducer;
