import { QuestionProgressStatusType } from "@/models/question-progress.model";

export interface QuestionProgressDto {
  id: string;
  questionId: string;
  createdOn: Date;
  modifiedOn: Date;
  score: number | null;
  status: QuestionProgressStatusType
  data: QuestionProgress[];
}

interface QuestionProgress {
  selectedQuestionId: string;
  selectedOptionId: string;
}
