export interface QuestionProgressDto {
  id: string;
  questionId: string;
  createdOn: Date;
  modifiedOn: Date;
  score: number | null;
  data: QuestionProgress[];
}

interface QuestionProgress {
  selectedQuestionId: string;
  selectedOptionId: string;
}
