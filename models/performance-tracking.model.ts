import {
  PerformanceTracking,
  PerformanceTrackingParsingData,
} from "@/dto/performane-tracking.dto";

export type PerformanceTrackingPeriodModel = "this_week" | "last_week";

export interface PerformanceTrackingQueryModel {
  documentId: string;
  period?: PerformanceTrackingPeriodModel;
}

export interface PerformanceTrackingModel {
  data: PerformanceTracking[];
  documentTitle: string;
  period: string;
}

export interface PerformanceTrackingPerQuestionModel {
  groupedQuestions: Record<
    string,
    Record<"correct" | "wrong", PerformanceTrackingParsingData[]>
  >;
  topicsEvaluatedCorrectly: string[];
  topicsEvaluatedWrongly: string[];
  percentageAnsweredCorrectly: number;
  percentageAnsweredWrongly: number;
  documentTitle: string;
  documentId: string;
  score: number;
  createdOn: Date;
}

export interface PerformanceTrackingPerQuestionQueryModel {
  questionId: string;
}
