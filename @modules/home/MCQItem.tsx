import { QuestionOption, QuestionsModel } from "@/models/questions.model";
import React, { FC, useState } from "react";
import MCQOption from "./MCQOption";

interface Props extends QuestionsModel {
  questionNumber: number;
  handleSetQuestionAnswer: (id: string, value: boolean) => void;
}

const MCQItem: FC<Props> = ({
  answerId,
  explanation,
  id,
  options,
  question,
  questionNumber,
  correctAnswerId,
  handleSetQuestionAnswer,
}) => {
  const [selectedOption, setSelectedOption] = useState<QuestionOption | null>(
    null
  );

  return (
    <div className="w-full bg-white px-4 py-8 rounded-xl max-w-[600px] mx-auto shadow-md">
      <p className="font-semibold">
        {questionNumber}. {question}
      </p>
      <div className="py-4 flex flex-col gap-6">
        {options.map((opt, idx) => {
          return (
            <MCQOption
              option={opt}
              key={idx}
              isChecked={!selectedOption ? false : selectedOption.id === opt.id}
              handleChecked={(option) => {
                setSelectedOption(option);

                if (correctAnswerId === option.id) {
                  handleSetQuestionAnswer(id, true);
                } else {
                  handleSetQuestionAnswer(id, false);
                }
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default MCQItem;
