import { testFormats } from "@/@modules/home/GenerateQuestionsForm";
import {
  StudyToolTitle,
  TestFormatItem,
  TestFormatTitle,
} from "@/@modules/home/TestFormatItem";
import { TopicsV2Model } from "@/models/file-upload.model";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type StepTitle =
  | "TEST_FORMAT"
  | "TOTAL_QUESTIONS"
  | "ADDITIONAL_SETTINGS";

export const Steps = new Map<StepTitle, number>([
  ["TEST_FORMAT", 1],
  ["TOTAL_QUESTIONS", 2],
  ["ADDITIONAL_SETTINGS", 3],
]);

export const testFormatsMap = new Map<
  TestFormatTitle | StudyToolTitle,
  TestFormatItem
>(testFormats.map((item) => [item.title, item]));

interface OpenNewTestPayload {
  documentId: string;
  topics: TopicsV2Model[];
  selectedTopics?: TopicsV2Model[]
}

export interface NewTestSlice {
  selectedTestFormat: number;
  currentStep: number;
  totalQuestions: number;
  topics: TopicsV2Model[];
  documentId: string | null;
  selectedTopics: TopicsV2Model[];
  isSummaryView: boolean;
  isNewTestFormOpen: boolean;

  additionalSettings: {
    permissions: {
      canUseDifficulty: boolean;
      canUseCaseStudies: boolean;
    };
    isCaseStudies: boolean;
    isBaseView: boolean;
    isDifficultyView: boolean;
    difficulty: string;
  };
}

const initialState: NewTestSlice = {
  selectedTestFormat: 3,
  currentStep: Steps.get("TEST_FORMAT")!,
  totalQuestions: 5,
  documentId: null,
  isNewTestFormOpen: false,
  topics: [],
  selectedTopics: [],
  isSummaryView: false,
  additionalSettings: {
    difficulty: "medium",
    isBaseView: true,
    isCaseStudies: false,
    isDifficultyView: false,
    permissions: {
      canUseCaseStudies: true,
      canUseDifficulty: true,
    },
  },
};

export const newTestSlice = createSlice({
  name: "new_test_slice",
  initialState,
  reducers: {
    selectTestFormat(state, action: PayloadAction<number>) {
      state.selectedTestFormat = action.payload;
    },
    setCurrentStep(state, action: PayloadAction<StepTitle>) {
      state.currentStep = Steps.get(action.payload)!;
    },
    setDifficulty(state, action: PayloadAction<string>) {
      state.additionalSettings.difficulty = action.payload;
    },
    setTotalQuestion(state, action: PayloadAction<number>) {
      state.totalQuestions = action.payload;
    },
    setSelectedTopics(state, action: PayloadAction<TopicsV2Model[]>) {
      state.selectedTopics = action.payload;
    },
    setSummaryView(state, action: PayloadAction<boolean>) {
      state.isSummaryView = action.payload;
    },
    setNewTestDocumentId(state, action: PayloadAction<string>) {
      state.documentId = action.payload;
    },
    openNewTestForm(state, action: PayloadAction<OpenNewTestPayload>) {
      state.documentId = action.payload.documentId;
      state.topics = action.payload.topics;
      if (action.payload.selectedTopics?.length) {
        state.selectedTopics = action.payload.selectedTopics
      }
      state.isNewTestFormOpen = true;
    },
    patchAdditionalSettings(
      state,
      action: PayloadAction<Partial<typeof initialState.additionalSettings>>
    ) {
      state.additionalSettings = {
        ...state.additionalSettings,
        ...action.payload,
      };
    },
    resetNewTestForm() {
      return initialState;
    },
  },
});

export const {
  selectTestFormat,
  setCurrentStep,
  setTotalQuestion,
  patchAdditionalSettings,
  setDifficulty,
  setSelectedTopics,
  setSummaryView,
  setNewTestDocumentId,
  openNewTestForm,
  resetNewTestForm,
} = newTestSlice.actions;

export const newTestSliceReducer = newTestSlice.reducer;
