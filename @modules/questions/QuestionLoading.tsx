import React, { FC } from "react";
import { AnimatePresence } from "framer-motion";
import Button from "@/@shared/ui/Button";
import { FileTypeTileExt } from "@/@shared/components/FileTypeTile";
import PreparingTestCard from "./PreparingTestCard";

interface Props {
  handleViewSummary: () => void;
  percentageLoading: number;
  handleStartTest: () => void;
  fileExt?: FileTypeTileExt;
}

const QuestionLoading: FC<Props> = ({
  handleViewSummary,
  percentageLoading,
  handleStartTest,
  fileExt,
}) => {
  const isReady = percentageLoading >= 100;
  return (
    <AnimatePresence>
      <PreparingTestCard
        percentage={percentageLoading}
        fileExt={fileExt}
        title={isReady ? "Your test is ready!" : "Preparing test"}
        message={
          isReady
            ? "You may begin your test."
            : "Review a quick summary while we generate your test!"
        }
        actions={
          <>
            <Button
              title="View summary"
              size="large"
              onClick={handleViewSummary}
              variant="outlined"
              fullWidth
            />
            <Button
              title="Start test"
              size="large"
              className="max-md:order-first"
              disabled={percentageLoading < 100}
              onClick={handleStartTest}
              fullWidth
            />
          </>
        }
      />
    </AnimatePresence>
  );
};

export default QuestionLoading;
