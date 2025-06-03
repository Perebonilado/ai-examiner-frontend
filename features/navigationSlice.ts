import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface NavigationSlice {
  navOpen: boolean;
}

const initialState: NavigationSlice = {
  navOpen: false
};

export const navigationSlice = createSlice({
  name: "navigation_slice",
  initialState,
  reducers: {
    toggleNavigation(state, action: PayloadAction<boolean>) {
      state.navOpen = action.payload;
    },
  },
});

export const { toggleNavigation } = navigationSlice.actions;

export const navigationSliceReducer = navigationSlice.reducer;
