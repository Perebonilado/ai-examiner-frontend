import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { NotSureQuestion } from "../models/questions.model";
import { HighlightToPrompt } from "@/models/document-message.model";

export interface MessageItem {
  message: string;
  sender: "user" | "system";
  id: string;
  createdOn: Date;
  image?: string;
}

export interface ImageDescription {
  image: string;
  searchPhrase: string;
}

interface DocumentChatState {
  documentIdInView: string;
  documentTitleInView: string;
  messages: MessageItem[];
  totalMessagesInDb: number;
  notSureMessage: string;
  isChatOpen: boolean;
  notSureQuestion: NotSureQuestion | null;
  highlightToPrompt: HighlightToPrompt | null;
  imageDescription: ImageDescription | null;
}

const initialState: DocumentChatState = {
  documentIdInView: "",
  documentTitleInView: "",
  messages: <MessageItem[]>[],
  totalMessagesInDb: 0,
  notSureMessage: "",
  isChatOpen: false,
  notSureQuestion: null,
  highlightToPrompt: null,
  imageDescription: null,
};

export const documentChatSlice = createSlice({
  name: "document_chat",
  initialState,
  reducers: {
    setDocumentIdInView: (state, action: PayloadAction<string>) => {
      state.documentIdInView = action.payload;
    },
    setDocumentTitleInView: (state, action: PayloadAction<string>) => {
      state.documentTitleInView = action.payload;
    },
    setMessages: (state, action: PayloadAction<MessageItem[]>) => {
      state.messages = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    setTotalMessagesInDb: (state, action: PayloadAction<number>) => {
      state.totalMessagesInDb = action.payload;
    },
    appendNewMessage: (state, action: PayloadAction<MessageItem>) => {
      state.messages = [...state.messages, action.payload];
    },
    setNotSureMessage: (state, action: PayloadAction<string>) => {
      state.notSureMessage = action.payload;
    },
    setNotSureQuestion: (
      state,
      action: PayloadAction<NotSureQuestion | null>
    ) => {
      state.notSureQuestion = action.payload;
    },
    setHighlightToPrompt: (
      state,
      action: PayloadAction<HighlightToPrompt | null>
    ) => {
      state.highlightToPrompt = action.payload;
    },
    setImageDescription: (
      state,
      action: PayloadAction<ImageDescription | null>
    ) => {
      state.imageDescription = action.payload;
    },
    setIsChatOpen: (state, action: PayloadAction<boolean>) => {
      state.isChatOpen = action.payload;
    },
    resetDocumentChat: (state) => {
      state = initialState;
    },
  },
});

export const {
  setDocumentIdInView,
  setDocumentTitleInView,
  setMessages,
  setTotalMessagesInDb,
  appendNewMessage,
  setNotSureMessage,
  setNotSureQuestion,
  setHighlightToPrompt,
  clearMessages,
  setIsChatOpen,
  resetDocumentChat,
  setImageDescription,
} = documentChatSlice.actions;

export const documentChatReducer = documentChatSlice.reducer;
