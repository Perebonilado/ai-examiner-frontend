import Button from "@/@shared/ui/Button";
import React, { FC } from "react";
import { AnimatePresence } from "framer-motion";
import PreparingTestCard, { useDocumentFileExt } from "./PreparingTestCard";

interface Props {
  percentageLoading: number;
  handleStartTest: () => void;
  handleClose: () => void;
  /** The document being turned into a test; used for the file-type tile. */
  documentId?: string | null;
}

const QuestionGenerationSuccessModal: FC<Props> = ({
  handleStartTest,
  percentageLoading,
  handleClose,
  documentId,
}) => {
  const fileExt = useDocumentFileExt(documentId);
  return (
    <AnimatePresence>
      <PreparingTestCard
        percentage={percentageLoading}
        fileExt={fileExt}
        title="Your test is ready!"
        message="You may begin your test."
        twoActions={false}
        handleClose={handleClose}
        actions={
          <Button
            title="Start test"
            size="large"
            onClick={handleStartTest}
            fullWidth
          />
        }
      />
    </AnimatePresence>
  );
};

export default QuestionGenerationSuccessModal;
