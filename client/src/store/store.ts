import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./Slice/authSlice"; // add this

export const store = configureStore({
  reducer: {
    auth: authReducer, // add this
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
