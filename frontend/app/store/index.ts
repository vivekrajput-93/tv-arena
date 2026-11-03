import { configureStore } from "@reduxjs/toolkit";
import { apiSlce } from "../hooks/apiSlice";
import { searchSlice } from "./SearchSlice";


export const store = configureStore({
  reducer: {
    [apiSlce.reducerPath]: apiSlce.reducer,
    search: searchSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlce.middleware),
});

export type RootState = ReturnType<typeof store.getState>;  
export type AppDispatch = typeof store.dispatch;