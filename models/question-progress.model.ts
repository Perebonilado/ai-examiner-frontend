export interface QuestionProgressPayloadModel {
  data: {
    selectedQuestionId: string;
    selectedOptionId: string;
  };
  id: string;
}

export interface QuestionProgressModel {
  data: {
    selectedQuestionId: string;
    selectedOptionId: string;
  }[];
  score: number | null;
}

export interface QuestionProgressQueryModel {
  id: string;
}
