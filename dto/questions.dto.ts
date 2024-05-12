export interface QuestionsDto {
  id: string;
  question: string;
  options: { value: string; id: string }[];
  correctAnswerId: string;
  explanation: string;
}

export interface QuestionSummaryDto {
  courseDocumentId: string;
  createdOn: Date;
  id: string;
  count: number;
}

export interface AllQuestionSummaryDto {
  data: QuestionSummaryDto[];
  status: number;
}
