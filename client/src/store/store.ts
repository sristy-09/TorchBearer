import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./Slice/authSlice";
import spacesReducer from "./Slice/spacesSlice";
import topicsReducer from "./Slice/topicsSlice";
import postsReducer from "./Slice/postsSlice";
import recommendationsReducer from "./Slice/recommendationsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    spaces: spacesReducer,
    topics: topicsReducer,
    posts: postsReducer,
    recommendations: recommendationsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
