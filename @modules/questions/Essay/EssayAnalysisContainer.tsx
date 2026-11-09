import { EssayQuestionModel } from "@/models/questions.model";
import React, { FC } from "react";
import EssayAnalysisItemAccordion from "./EssayAnalysisItemAccordion";
import Button from "@/@shared/ui/Button";

interface Props {
  data: EssayQuestionModel[];
  handleGenerateMoreQuestions: () => void;
  handleDone: () => void;
}

const EssayAnalysisContainer: FC<Props> = ({
  data,
  handleDone,
  handleGenerateMoreQuestions,
}) => {
  return (
    <div className="w-full">
      <div className="flex flex-col gap-7 max-md:gap-5">
        {data.map((analysis, idx) => {
          return (
            <EssayAnalysisItemAccordion
              key={idx}
              {...analysis}
              questionNumber={idx + 1}
              totalQuestions={data.length}
            />
          );
        })}
      </div>

      <div data-phone-bottom-bar="" className="flex justify-end gap-2.5 mt-8 max-md:sticky max-md:bottom-0 max-md:z-10 max-md:-mx-4 max-md:mt-6 max-md:px-4 max-md:pt-3 max-md:pb-[calc(12px+env(safe-area-inset-bottom))] max-md:border-t max-md:border-line max-md:bg-surface-glass max-md:backdrop-blur-md">
        <Button
          title="New test"
          onClick={() => {
            if (handleGenerateMoreQuestions) {
              handleGenerateMoreQuestions();
            }
          }}
          size="large"
          variant="outlined"
          className="max-md:flex-1"
        />
        <Button
          title="Done"
          size="large"
          onClick={handleDone}
          className="min-w-[160px] max-md:min-w-0 max-md:flex-1"
        />
      </div>
    </div>
  );
};

export default EssayAnalysisContainer;
