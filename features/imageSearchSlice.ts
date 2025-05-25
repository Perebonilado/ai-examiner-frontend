import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface ImageSearchSlice {
  searchQuery: string;
  isImageSearchOpen: boolean;
  imageSearchDocId: string;
}

const initialState: ImageSearchSlice = {
  searchQuery: "",
  isImageSearchOpen: false,
  imageSearchDocId: "",
};

export const imageSearchSlice = createSlice({
  name: "image_search",
  initialState,
  reducers: {
    setImageSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setImageSearchOpen: (state, action: PayloadAction<boolean>) => {
      state.isImageSearchOpen = action.payload;
    },
    setImageSearchDocId: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
  },
});

export const { setImageSearchQuery, setImageSearchOpen, setImageSearchDocId } =
  imageSearchSlice.actions;

export const imageSearchReducer = imageSearchSlice.reducer;
