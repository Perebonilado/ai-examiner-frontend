import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface LoadingAndErrorState {
  loading: boolean;
  loadingMessage: string;
}

const initialState: LoadingAndErrorState = {
  loading: false,
  loadingMessage: "",
};

export const loaderSlice = createSlice({
  name: "loading_error_slice",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<{ loading: boolean }>) => {
      state.loading = action.payload.loading;
    },
    setLoadingMessage: (
      state,
      action: PayloadAction<{ loadingMessage: string }>
    ) => {
      state.loadingMessage = action.payload.loadingMessage;
    },
  },
});

export const { setLoading, setLoadingMessage } = loaderSlice.actions;

export default loaderSlice.reducer;
