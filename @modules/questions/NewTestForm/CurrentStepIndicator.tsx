import React, { FC } from "react";
import cn from "classnames";

interface Props {
  totalSteps: number;
  currentStep: number;
}

const CurrentStepIndicator: FC<Props> = ({ currentStep, totalSteps }) => {
  return (
    <div className="px-5 pt-1.5">
      <p className="text-[13px] font-semibold text-accent tabular-nums">
        Step {currentStep} of {totalSteps}
      </p>
      <div className="flex items-center gap-1 mt-2" aria-hidden>
        {new Array(totalSteps).fill("").map((_, idx) => {
          const step = idx + 1;
          return (
            <span
              key={step}
              className={cn("h-1 flex-1 rounded-full transition-colors", {
                ["bg-sunken"]: step > currentStep,
                ["bg-accent"]: step <= currentStep,
              })}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CurrentStepIndicator;
