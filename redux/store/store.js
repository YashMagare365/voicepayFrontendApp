"use client"
import { configureStore } from "@reduxjs/toolkit";
import UserSlice from "../slices/UserSlice";

// config the store
const store = configureStore({
  reducer: {
    user: UserSlice,
  },
});

// export default the store
export default store;