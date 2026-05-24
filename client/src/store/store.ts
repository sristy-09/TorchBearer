import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./Slice/authSlice";
import spacesReducer from "./Slice/spacesSlice";
import topicsReducer from "./Slice/topicsSlice";
import postsReducer from "./Slice/postsSlice";
import notificationReducer from "./Slice/notificationSlice";
import recommendationsReducer from "./Slice/recommendationsSlice";
import adminReducer from "./Slice/adminSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    spaces: spacesReducer,
    topics: topicsReducer,
    posts: postsReducer,
    notifications: notificationReducer,
    recommendations: recommendationsReducer,
    admin: adminReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
