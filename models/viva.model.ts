export interface VivaAnalysisModel {
    question: string;
    questionNumber: number;
    totalQuestions: number;
    grade: "fail" | "pass";
    userResponse: string;
    systemResponse: string
}