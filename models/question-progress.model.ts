export interface QuestionProgressPayloadModel {
  data?: {
    selectedQuestionId: string;
    selectedOptionId: string;
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
  }[];
  score: number | null;
  status: QuestionProgressStatusType
}

export interface QuestionProgressQueryModel {
  id: string;
}
