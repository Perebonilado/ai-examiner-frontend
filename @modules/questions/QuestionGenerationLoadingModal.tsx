import React, { FC, useEffect, useState } from "react";
import QuestionLoading from "./QuestionLoading";
import ViewDocumentSummary from "./ViewDocumentSummary";
import { useRouter } from "next/router";
import TopLevelGenerateQuestionsLoader from "./TopLevelGenerateQuestionsLoader";
import QuestionGenerationSuccessModal from "./QuestionGenerationSuccessModal";

interface Props {
  isComplete: boolean;
  handleStartTest: () => void;
  handleViewSummary: () => void;
  showTopLevelLoader: boolean;
}

const QuestionGenerationLoadingModal: FC<Props> = ({
  isComplete,
  handleStartTest,
  handleViewSummary,
  showTopLevelLoader,
}) => {
  const [progress, setProgress] = useState(0);
  let interval: NodeJS.Timeout;
  useEffect(() => {
    if (isComplete) {
      // Process done → jump to 100%
      setProgress(100);
      return;
    }

    interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 90) {
          return prev + 1;
        }
        return prev;
      });
    }, 444); // 1% every 444ms → ~90% in 40s

    return () => clearInterval(interval);
  }, [isComplete]);

  const resetProgress = () => {
    clearInterval(interval);
    setProgress(0);
  };

  return (
    <>
      {showTopLevelLoader  && (
        <TopLevelGenerateQuestionsLoader percentageLoading={progress} />
      )}
      {!showTopLevelLoader  && (
        <QuestionLoading
          percentageLoading={progress}
          handleViewSummary={handleViewSummary}
          handleStartTest={() => {
            handleStartTest();
            resetProgress();
          }}
        />
      )}
    </>
  );
};

export default QuestionGenerationLoadingModal;
