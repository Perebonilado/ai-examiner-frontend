import Avatar from "@/@shared/components/Avatar";
import React, { forwardRef } from "react";
import Button from "@/@shared/ui/Button";
import { useModalContext } from "@/contexts/ModalContext";
import { generateDocumentCardColorFromScore } from "@/utils";

interface Props {
  scorePercentage: number;
  title: string;
  handleScrollToTop: () => void;
  allowMoreQuestionGeneration?: boolean;
  handleGenerateMoreQuestions?: () => void;
}

const SubmissionModal = forwardRef<HTMLDivElement, Props>(
  ({ allowMoreQuestionGeneration = false, ...props }, ref) => {
    const color = generateDocumentCardColorFromScore(props.scorePercentage);

    const { setModalContent } = useModalContext();

    return (
      <div
        ref={ref}
        className="w-full max-w-[370px] max-md:max-w-[320px] rounded-xl shadow-lg p-8 py-14 flex flex-col gap-10 items-center justify-center bg-white"
      >
        <p className="text-lg text-center font-bold">{props.title} Scores</p>

        <div
          className="w-[150px] h-[150px] rounded-full flex flex-col items-center justify-center text-center gap-2"
          style={{
            borderColor: color.fill,
            background: color.background,
            borderWidth: "2px",
          }}
        >
          <p className="text-2xl text-center font-bold">
            {props.scorePercentage.toFixed()}%
          </p>
          <p className="text-xs font-semibold">{color.message}</p>
        </div>

        <p className="text-sm text-gray-500 text-center">{color.subMessage}</p>

        <div className="w-full flex flex-col gap-3">
          <Button
            title="Review answers"
            onClick={() => {
              setModalContent(null);
              props.handleScrollToTop();
            }}
            fullWidth
            size="large"
          />
          {allowMoreQuestionGeneration && props.handleGenerateMoreQuestions && (
            <Button
              title="New Questions"
              fullWidth
              onClick={props.handleGenerateMoreQuestions}
              variant="outlined"
              size="large"
            />
          )}
        </div>
      </div>
    );
  }
);

export default SubmissionModal;
