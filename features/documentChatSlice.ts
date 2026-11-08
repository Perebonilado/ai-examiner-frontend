import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { NotSureQuestion } from "../models/questions.model";
import { HighlightToPrompt } from "@/models/document-message.model";

/**
 * A reply's state while it's on screen. Messages loaded from the server have none (they're done).
 * - streaming: being written (or about to be)
 * - stopped: the student pressed Stop (or a new question replaced it)
 * - truncated: cut off by the length limit
 * - error: failed; the question is saved, so Retry resends it
 */
export type MessageStatus = "streaming" | "done" | "stopped" | "truncated" | "error";

export interface MessageItem {
  message: string;
  sender: "user" | "system";
  id: string;
  createdOn: Date;
  image?: string;
  status?: MessageStatus;
  /** Before the first words: "reading" the document, then "thinking". */
  phase?: "reading" | "thinking";
  /** Pages the reply is reading (search mode only). */
  pages?: number[];
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
  /** Readers open that can jump to a page (Easy Read, the PDF viewer). */
  pageReaders: number;
  /** A page citation the student clicked; `at` makes repeat clicks on one page count. */
  requestedPage: { page: number; at: number } | null;
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
  pageReaders: 0,
  requestedPage: null,
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
    updateMessage: (
      state,
      action: PayloadAction<{ id: string; changes: Partial<MessageItem> }>
    ) => {
      const message = state.messages.find((m) => m.id === action.payload.id);
      if (message) Object.assign(message, action.payload.changes);
    },
    appendToMessage: (
      state,
      action: PayloadAction<{ id: string; text: string }>
    ) => {
      const message = state.messages.find((m) => m.id === action.payload.id);
      if (message) {
        message.message += action.payload.text;
        message.phase = undefined;
      }
    },
    removeMessage: (state, action: PayloadAction<string>) => {
      state.messages = state.messages.filter((m) => m.id !== action.payload);
    },
    addPageReader: (state) => {
      state.pageReaders += 1;
    },
    removePageReader: (state) => {
      state.pageReaders = Math.max(0, state.pageReaders - 1);
    },
    requestPage: (state, action: PayloadAction<number>) => {
      state.requestedPage = { page: action.payload, at: Date.now() };
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
  updateMessage,
  appendToMessage,
  removeMessage,
  addPageReader,
  removePageReader,
  requestPage,
} = documentChatSlice.actions;

export const documentChatReducer = documentChatSlice.reducer;
