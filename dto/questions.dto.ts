import { MetaDto } from "./meta.dto";

export interface QuestionsDto {
  id: string;
  question: string;
  options: { value: string; id: string }[];
  correctAnswerId: string;
  explanation: string;
}

export interface GetQuestionsByIdDto {
  id: string;
  documentTitle: string;
  documentId: string;
  createdOn: Date;
  questions: QuestionsDto[]
}

export interface QuestionSummaryDto {
  courseDocumentId: string;
  createdOn: Date;
  id: string;
  count: number;
  score: number | null
}

export interface AllQuestionSummaryDto {
  data: QuestionSummaryDto[];
  status: number;
  meta: MetaDto
}
