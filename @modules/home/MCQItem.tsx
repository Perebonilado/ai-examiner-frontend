import { QuestionOption, QuestionsModel } from "@/models/questions.model";
import React, { FC, useState } from "react";
import MCQOption from "./MCQOption";
import cn from "classnames";

interface Props extends QuestionsModel {
  questionNumber: number;
  handleSetQuestionAnswer: (id: string, value: boolean) => void;
  submitted: boolean;
}

const MCQItem: FC<Props> = ({
  answerId,
  explanation,
  id,
  options,
  question,
  questionNumber,
  correctAnswerId,
  submitted,
  handleSetQuestionAnswer,
}) => {
  const [selectedOption, setSelectedOption] = useState<QuestionOption | null>(
    null
  );

  const [isCorrect, setIsCorrect] = useState(false);

  const correctAnswerMarkerStyling = cn(`font-bold pb-4`, {
    [`text-green-600`]: isCorrect,
    [`text-rose-600`]: !isCorrect,
  });

  return (
    <div className="w-full bg-white px-4 py-8 rounded-xl max-w-[600px] mx-auto shadow-md">
      {submitted && (
        <p className={correctAnswerMarkerStyling}>
          {isCorrect ? "Correct!" : "Wrong"}
        </p>
      )}
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
              submitted={submitted}
              isRightOption={correctAnswerId === opt.id}
              handleChecked={(option) => {
                setSelectedOption(option);
                
                if (correctAnswerId === option.id) {
                  handleSetQuestionAnswer(id, true);
                  setIsCorrect(true);
                } else {
                  handleSetQuestionAnswer(id, false);
                  setIsCorrect(false);
                }
              }}
            />
          );
        })}
      </div>
      {submitted && (
        <p className="text-sm font-semibold text-blue-600">
          Explanation: {explanation}
        </p>
      )}
    </div>
  );
};

export default MCQItem;
