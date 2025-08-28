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
    <div className="w-full max-w-[900px] mx-auto mt-10">
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

      <div className="flex max-sm:justify-center max-sm:items-center max-sm:flex-col-reverse gap-4 justify-end mt-20">
        <Button
          title="New Test"
          onClick={() => {
            if (handleGenerateMoreQuestions) {
              handleGenerateMoreQuestions();
            }
          }}
          size="large"
          variant="outlined"
          className="max-sm:w-full"
        />
        <Button
          title="Done"
          size="large"
          onClick={handleDone}
          className="max-sm:w-full"
        />
      </div>
    </div>
  );
};

export default EssayAnalysisContainer;
