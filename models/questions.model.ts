export interface QuestionsModel {
  id: string;
  question: string;
  options: QuestionOption[]
  answerId: string;
  explanation: string;
}

export interface QuestionOption { value: string; id: string };