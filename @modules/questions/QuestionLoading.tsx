import React, { FC } from "react";
import ProgressBar from "@ramonak/react-progress-bar";
import Button from "@/@shared/ui/Button";

interface Props {
  handleViewSummary: () => void;
  percentageLoading: number;
  handleStartTest: () => void;
}

const QuestionLoading: FC<Props> = ({
  handleViewSummary,
  percentageLoading,
  handleStartTest,
}) => {
  return (
    <div className="md:max-w-[450px] max-w-[95vw] w-[90vw] flex flex-col items-center justify-center bg-white py-14 max-h-[90vh] rounded-xl">
      <p className="text-center px-3 text-2xl font-semibold tracking-wide text-gray-800">
        {percentageLoading < 100 ? "Preparing Test" : "Your test is ready!"}
      </p>
      <p className="text-sm text-center text-gray-500 leading-relaxed max-w-xs mt-1">
        {percentageLoading < 100
          ? `Review a quick summary while we generate your test!`
          : "You may begin your test."}
      </p>

      <div className="px-8 mt-4 mb-8 w-full">
        <ProgressBar
          completed={percentageLoading}
          height="6px"
          customLabel=" "
        />
      </div>

      <div className="mt-6">
        <Button
          title="View Summary"
          size="large"
          onClick={handleViewSummary}
          variant="outlined"
        />
        <Button
          title="Start Test"
          size="large"
          className="mt-4"
          disabled={percentageLoading < 100}
          onClick={handleStartTest}
          fullWidth
        />
      </div>
    </div>
  );
};

export default QuestionLoading;
