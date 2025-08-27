import React, { FC } from "react";
import cn from "classnames";

interface Props {
  totalSteps: number;
  currentStep: number;
}

const CurrentStepIndicator: FC<Props> = ({ currentStep, totalSteps }) => {
  return (
    <div className="py-4">
      <p className="text-[#9333EA] font-semibold mb-2">
        Step {currentStep} of {totalSteps}
      </p>
      <div className="flex items-center justify-between gap-1">
        {new Array(totalSteps).fill("").map((_, idx) => {
          const step = idx + 1;
          return (
            <div
              className={cn("h-[2px] flex-1 rounded-full", {
                ["bg-[#D9D9D9]"]: step > currentStep,
                ["bg-[#2F004F]"]: step <= currentStep,
              })}
            ></div>
          );
        })}
      </div>
    </div>
  );
};

export default CurrentStepIndicator;
