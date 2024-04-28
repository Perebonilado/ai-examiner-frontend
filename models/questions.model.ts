export interface QuestionsModel {
  id: string;
  question: string;
  options: { value: string; id: string }[];
  answerId: string;
  explanation: string;
}
