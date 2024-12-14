import Avatar from "@/@shared/components/Avatar";
import React, { forwardRef } from "react";
import Button from "@/@shared/ui/Button";
import { useModalContext } from "@/contexts/ModalContext";
import { generateDocumentCardColorFromScore } from "@/utils";
import CloseIcon from "@/icons/CloseIcon";

interface Props {
  scorePercentage: number;
  title: string;
  handleScrollToTop: () => void;
  allowPerformanceOverview?: boolean;
  handlePerformanceOverview?: () => void;
}

const SubmissionModal = forwardRef<HTMLDivElement, Props>(
  ({ allowPerformanceOverview = false, ...props }, ref) => {
    const color = generateDocumentCardColorFromScore(props.scorePercentage);

    const { setModalContent } = useModalContext();

    return (
      <div
        ref={ref}
        className="w-full relative max-w-[370px] max-md:max-w-[320px] rounded-xl shadow-lg p-4 py-14 flex flex-col gap-6 items-center justify-center bg-white"
      >
        <div className="absolute top-4 right-6">
          <button
            onClick={() => {
              setModalContent(null);
            }}
          >
            <CloseIcon />
          </button>
        </div>
        <p className="text-lg text-center font-bold">{props.title}</p>

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

        <div className="w-full flex flex-col gap-1">
          <Button
            title="Review answers"
            onClick={() => {
              setModalContent(null);
              props.handleScrollToTop();
            }}
            fullWidth
            size="large"
          />
          {allowPerformanceOverview && props.handlePerformanceOverview && (
            <Button
              title="Performance Overview"
              fullWidth
              onClick={props.handlePerformanceOverview}
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
