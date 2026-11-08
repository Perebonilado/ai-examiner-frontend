import React, { FC, useEffect, useState } from "react";
import QuestionLoading from "./QuestionLoading";
import ViewDocumentSummary from "./ViewDocumentSummary";
import { useRouter } from "next/router";
import TopLevelGenerateQuestionsLoader from "./TopLevelGenerateQuestionsLoader";
import { useDocumentFileExt } from "./PreparingTestCard";

interface Props {
  isComplete: boolean;
  handleStartTest: () => void;
  handleViewSummary: () => void;
  showTopLevelLoader: boolean;
  /** The document being turned into a test; used for the file-type tile. */
  documentId?: string | null;
}

const QuestionGenerationLoadingModal: FC<Props> = ({
  isComplete,
  handleStartTest,
  handleViewSummary,
  showTopLevelLoader,
  documentId,
}) => {
  const fileExt = useDocumentFileExt(documentId);
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
          fileExt={fileExt}
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
