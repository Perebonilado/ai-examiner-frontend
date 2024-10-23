export interface QuestionProgressPayloadModel {
  data?: {
    selectedQuestionId: string;
    selectedOptionId: string;
    selectedAnswer?: boolean;
  };
  id: string;
  status?: QuestionProgressStatusType;
  clearExistingProgress: boolean;
}

export type QuestionProgressStatusType = "in_progress" | "submitted";

export interface QuestionProgressModel {
  data: {
    selectedQuestionId: string;
    selectedOptionId: string;
    selectedAnswer?: boolean;
  }[];
  score: number | null;
  status: QuestionProgressStatusType
}

export interface QuestionProgressQueryModel {
  id: string;
}
