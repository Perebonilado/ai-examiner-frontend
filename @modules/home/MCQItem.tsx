import Checkbox from "@/@shared/ui/Input/Checkbox/Checkbox";
import { QuestionsModel } from "@/models/questions.model";
import React, { FC } from "react";

interface Props extends QuestionsModel {
  questionNumber: number;
}

const MCQItem: FC<Props> = ({
  answerId,
  explanation,
  id,
  options,
  question,
  questionNumber,
}) => {
  return (
    <div className="w-full bg-white px-4 py-8 rounded-xl max-w-[600px] mx-auto shadow-md">
      <p className="font-semibold">
        {questionNumber}. {question}
      </p>
      <div className="py-4 flex flex-col gap-6">
        {options.map((opt, idx) => {
          return (
            <div key={idx} className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Checkbox />
              </div>
              <p className="text-sm">{opt.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MCQItem;
