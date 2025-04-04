import React, { FC, useEffect, useState } from "react";
import QuestionLoading from "./QuestionLoading";
import ViewDocumentSummary from "./ViewDocumentSummary";

interface Props {
  isComplete: boolean;
  handleStartTest: () => void;
  summary: string;
}

const QuestionGenerationLoadingModal: FC<Props> = ({
  isComplete,
  summary,
  handleStartTest,
}) => {
  const [isViewSummary, setIsViewSummary] = useState(false);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (isComplete) {
      // Process done → jump to 100%
      setProgress(100);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 90) {
          return prev + 1;
        }
        return prev;
      });
    }, 444); // 1% every 444ms → ~90% in 40s

    return () => clearInterval(interval);
  }, [isComplete]);
  return !isViewSummary ? (
    <QuestionLoading
      percentageLoading={progress}
      handleViewSummary={() => {
        setIsViewSummary(true);
      }}
      handleStartTest={handleStartTest}
    />
  ) : (
    <ViewDocumentSummary
      progress={progress}
      handleStartTest={handleStartTest}
      summary={summary}
      handleBack={() => {
        setIsViewSummary(false);
      }}
    />
  );
};

export default QuestionGenerationLoadingModal;
