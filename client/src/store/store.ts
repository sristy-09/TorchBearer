import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./Slice/authSlice"; // add this
import spacesReducer from "./Slice/spacesSlice";
import topicsReducer from "./Slice/topicsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer, //add this
    spaces: spacesReducer,
    topics: topicsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
