import React, { FC, useEffect, useState } from "react";
import cn from "classnames";
import CheckIcon from "@/icons/CheckIcon";
import CancelIcon from "@/icons/CancelIcon";
import { MultipleTrueFalseQuestionOption } from "@/models/questions.model";

interface Props {
  submitted: boolean;
  option: MultipleTrueFalseQuestionOption;
  handleSetQuestionAnswer: ({
    id,
    selectedAnswer,
    correctAnswer,
  }: {
    id: string;
    selectedAnswer: boolean;
    correctAnswer: boolean;
  }) => void;
  selectedAnswerInProgress: boolean | null;
}

const MultipleTrueFalseItem: FC<Props> = ({
  submitted,
  option,
  handleSetQuestionAnswer,
  selectedAnswerInProgress,
}) => {
  const [selectedOption, setSelectedOption] = useState<boolean | null>(null);
  const [isRightOption, setIsRightOption] = useState(false);

  useEffect(() => {
    if (
      selectedAnswerInProgress !== null
    ) {
      setSelectedOption(selectedAnswerInProgress);
      if (selectedAnswerInProgress === option.answer) {
        setIsRightOption(true);
      } else {
        setIsRightOption(false);
      }
    }
  }, [selectedAnswerInProgress]);

  const rootClassName = cn(
    `
    border-2 flex text-sm max-sm:flex-col max-sm:items-end items-center gap-2 max-sm:gap-6 border-gray-200 min-h-[50px] rounded-[12px] p-4 bg-white flex items-center
    `,
    {
      ["!border-[#36CE10]"]: submitted && isRightOption,
      ["!border-[#EE6161]"]: submitted && !isRightOption,
    }
  );

  return (
    <div>
      <div className={rootClassName}>
        <p className="w-[85%] max-sm:w-[100%]">{option.value}</p>
        <div className="flex items-center max-sm:w-[30%] w-[15%] justify-between gap-2">
          <button
            style={{
              backgroundColor: selectedOption === true ? "#2F004F" : "unset",
            }}
            onClick={() => {
              if (!submitted) {
                setSelectedOption(true);

                handleSetQuestionAnswer({
                  id: option.id,
                  selectedAnswer: true,
                  correctAnswer: option.answer,
                });

                if (option.answer === true) {
                  setIsRightOption(true);
                } else {
                  setIsRightOption(false);
                }
              }
            }}
            className="border w-[30px] h-[30px] rounded-full flex items-center justify-center"
          >
            <CheckIcon fill={selectedOption === true ? "#FFFFFF" : "#CECECE"} />
          </button>
          <button
            style={{
              backgroundColor: selectedOption === false ? "#2F004F" : "unset",
            }}
            onClick={() => {
              if (!submitted) {
                setSelectedOption(false);

                handleSetQuestionAnswer({
                  id: option.id,
                  selectedAnswer: false,
                  correctAnswer: option.answer,
                });

                if (option.answer === false) {
                  setIsRightOption(true);
                } else {
                  setIsRightOption(false);
                }
              }
            }}
            className="border w-[30px] h-[30px] rounded-full flex items-center justify-center"
          >
            <CancelIcon
              fill={selectedOption === false ? "#FFFFFF" : "#CECECE"}
            />
          </button>
        </div>
      </div>
      {submitted && (
        <p className="pl-4 text-[#939393] text-xs mt-2">
          Correct Answer: {String(option.answer)}
        </p>
      )}
    </div>
  );
};

export default MultipleTrueFalseItem;
