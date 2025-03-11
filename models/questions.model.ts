import { MetaModel } from "./meta.model";
import { QuestionProgressStatusType } from "./question-progress.model";
import { VivaAnalysisModel } from "./viva.model";

export interface QuestionsModel {
  id: string;
  question: string;
  options: QuestionOption[];
  answerId: string;
  explanation: string;
  correctAnswerId: string;
  hint?: string;
  topic?: string;
}

export interface QuestionSourceRequestPayloadModel {
  question: string;
  documentId: string;
}

export interface QuestionSourceRequestModel {
  data: string;
}

export interface StartVivaPayload {
  questionId: string;
}

export interface StartVivaResponseModel {
  id: string;
}

export interface VivaRecordingModel {
  callRecording: string;
}

export interface VivaRecordingPayload {
  callId: string;
}

export interface MultipleTrueFalseQuestionModel {
  id: string;
  question: string;
  options: MultipleTrueFalseQuestionOption[];
  explanation: string;
  hint?: string;
  topic?: string;
}

export interface GetMultipleTrueFalseQuestionByIdModel
  extends Omit<GetQuestionByIdModel, "data"> {
  data: MultipleTrueFalseQuestionModel[];
}

export interface GetQuestionByIdModel {
  data: QuestionsModel[];
  documentTitle: string;
  topics: string[];
  documentId: string;
  createdOn: Date;
  allTopics: string[];
  fileId: string;
  analysis: {
    analysisData: VivaAnalysisModel[];
    callId: string;
  } | null;
}

export interface GetSharedQuestionModel {
  data: QuestionsModel[];
  documentTitle: string;
  createdOn: Date;
  sharedBy: {
    firstname: string;
    lastName: string;
  };
}

export interface GetSharedQuestionQueryModel {
  questionId: string;
}

export interface SaveSharedQuestionQueryModel {
  questionId: string;
}

export interface QuestionOption {
  value: string;
  id: string;
}

export interface MultipleTrueFalseQuestionOption extends QuestionOption {
  answer: boolean;
}

export interface QuestionSummaryModel {
  id: string;
  type: string;
  createdAt: Date;
  count: number;
  documentId: string;
  progressPercentage: number | null;
  status: QuestionProgressStatusType;
  totalAnswered: string | null;
  score: number | null;
  topics: string[];
}

export interface GetQuestionSummaryModel {
  questions: QuestionSummaryModel[];
  fileId: string;
  meta: MetaModel;
}

export interface GetQuestionsQueryModel {
  courseDocumentId: string;
  page: number;
  pageSize: number;
}

export interface GenerateQuestionsPayloadModel {
  documentId: string;
  questionCount: string;
  questionType: string;
  saveSelectedTopics: boolean;
  topics?: string[];
  selectedQuestionTopics?: string[];
  includeUseCases: boolean;
  difficulty: DifficultyType;
}

export interface CreateScorePayloadModel {
  score: number;
  documentId: string;
  questionId: string;
}

export interface DeleteQuestionModel {
  questionId: string;
}

export interface NotSureQuestion {
  question: string;
  options: string[];
  questionType: "Flash Cards" | "Multiple Choice" | "Multiple True-False";
}

export type DifficultyType = 'easy' | 'medium' | 'hard';