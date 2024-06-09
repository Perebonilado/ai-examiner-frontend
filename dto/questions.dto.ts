import { MetaDto } from "./meta.dto";

export interface QuestionsDto {
  id: string;
  question: string;
  options: { value: string; id: string }[];
  correctAnswerId: string;
  explanation: string;
  hint?: string;
}

export interface GetQuestionsByIdDto {
  id: string;
  documentTitle: string;
  documentId: string;
  createdOn: Date;
  questions: QuestionsDto[];
  score: number | null;
  topics: { title: string; id: number }[];
  
}

export interface QuestionSummaryDto {
  courseDocumentId: string;
  createdOn: Date;
  id: string;
  count: number;
  score: number | null;
  topics: { id: number; title: string }[];
  type: string;
}

export interface AllQuestionSummaryDto {
  data: {
    data: QuestionSummaryDto[];
    fileId: string;
  };
  status: number;
  meta: MetaDto;
}
