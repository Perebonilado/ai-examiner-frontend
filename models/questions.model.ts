import { MetaModel } from "./meta.model";

export interface QuestionsModel {
  id: string;
  question: string;
  options: QuestionOption[];
  answerId: string;
  explanation: string;
  correctAnswerId: string;
}

export interface GetQuestionByIdModel {
  data: QuestionsModel[];
  topicTitle: string;
}

export interface QuestionOption {
  value: string;
  id: string;
}

export interface QuestionSummaryModel {
  id: string;
  type: string;
  createdAt: Date;
  count: number;
  documentId: string;
}

export interface GetQuestionSummaryModel {
  questions: QuestionSummaryModel[];
  meta: MetaModel;
}

export interface GetQuestionsQueryModel {
  courseDocumentId: string;
  page: number;
  pageSize: number;
}
