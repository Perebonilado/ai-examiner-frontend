import { QuestionOption, QuestionsModel } from "@/models/questions.model";
import React, { FC, useEffect, useState } from "react";
import MCQOption from "./MCQOption";
import cn from "classnames";

interface Props extends QuestionsModel {
  questionNumber: number;
  handleSetQuestionAnswer: (id: string, value: boolean) => void;
  submitted: boolean;
  isResetSelection: boolean;
}

const MCQItem: FC<Props> = ({
  explanation,
  id,
  options,
  question,
  questionNumber,
  correctAnswerId,
  submitted,
  isResetSelection,
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

  useEffect(() => {
    // reset it as long as this state changes
    setSelectedOption(null);
  }, [isResetSelection]);

  return (
    <div className="w-full bg-zinc-50 p-[50px] max-md:px-[20px] rounded-xl max-w-[800px] mx-auto border border-gray-200 ">
      {submitted && (
        <p className={correctAnswerMarkerStyling}>
          {isCorrect ? "Correct!" : "Wrong"}
        </p>
      )}
      <p className="text-lg text-[#360B58]">
        Question {questionNumber}
      </p>
      <p className="my-8 font-semibold text-lg">
        {question}
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
