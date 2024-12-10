type Topic = string;
type Score = number;
type Review = string;

export type PerformanceTracking = [Topic, Score, Review];

export interface PerformanceTrackingDto {
  data: PerformanceTracking[];
  documentTitle: string;
  period: string;
}

export interface PerformanceTrackingParsingData {
  question: string;
  answeredCorrectly: boolean;
  topic: string;
  selectedQuestionId: string;
}

export interface PerformanceTrackingPerQuestionDto {
  groupedQuestions: Record<
    string,
    Record<"correct" | "wrong", PerformanceTrackingParsingData[]>
  >;
  topicsEvaluatedCorrectly: string[];
  topicsEvaluatedWrongly: string[];
  documentId: string;
  percentageAnsweredCorrectly: number;
  percentageAnsweredWrongly: number;
  documentTitle: string;
  score: number;
  createdOn: Date;
}
