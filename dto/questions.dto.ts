export interface QuestionsDto {
  id: string;
  question: string;
  options: { value: string; id: string }[];
  correctAnswerId: string;
  explanation: string;
}
