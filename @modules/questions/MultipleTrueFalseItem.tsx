import React, { FC, useEffect, useState } from "react";
import cn from "classnames";
import { Check, X } from "lucide-react";
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

  const handleChoose = (value: boolean) => {
    if (!submitted) {
      setSelectedOption(value);

      handleSetQuestionAnswer({
        id: option.id,
        selectedAnswer: value,
        correctAnswer: option.answer,
      });

      if (option.answer === value) {
        setIsRightOption(true);
      } else {
        setIsRightOption(false);
      }
    }
  };

  const rowClassName = cn(
    "grid grid-cols-[minmax(0,1fr)_88px] max-md:grid-cols-[minmax(0,1fr)_86px] gap-x-3.5 max-md:gap-x-3 items-center",
    {
      ["min-h-[60px] py-3"]: !submitted,
      ["rounded-xl border-[1.5px] px-3.5 py-3 max-md:px-3"]: submitted,
      ["border-success"]: submitted && isRightOption,
      ["border-danger"]: submitted && !isRightOption,
    }
  );

  // Button looks: before submit, a filled violet circle marks the choice. After submit, your
  // choice turns green (right) or red (wrong) and a missed correct answer gets a dashed green ring.
  const buttonClassName = (value: boolean) => {
    const isChosen = selectedOption === value;
    const isCorrectValue = option.answer === value;
    return cn(
      "w-10 h-10 rounded-full grid place-items-center p-0 border-[1.5px] transition-colors duration-150",
      !submitted && {
        ["bg-accent border-accent text-white"]: isChosen,
        ["bg-surface border-control text-muted hover:border-accent-300 hover:bg-accent-50 hover:text-accent-900"]:
          !isChosen,
      },
      submitted && {
        ["cursor-default"]: true,
        ["bg-success border-success text-white"]: isChosen && isCorrectValue,
        ["bg-danger border-danger text-white"]: isChosen && !isCorrectValue,
        ["bg-surface border-success text-success border-dashed"]:
          !isChosen && isCorrectValue,
        ["bg-transparent border-control text-faint opacity-70"]:
          !isChosen && !isCorrectValue,
      }
    );
  };

  const optionLabel = (value: boolean) => {
    const name = value ? "True" : "False";
    if (!submitted) return name;
    if (selectedOption === value) return `${name}, your answer`;
    if (option.answer === value) return `${name}, correct answer`;
    return name;
  };

  return (
    <div className={rowClassName}>
      <div
        className={cn("text-[15px] max-md:text-[14.5px] leading-normal", {
          ["text-ink"]: selectedOption !== null,
          ["text-body"]: selectedOption === null,
        })}
      >
        <span>{option.value}</span>
        {submitted && (
          <span
            className={cn(
              "mt-1 flex items-center gap-[5px] text-xs font-bold",
              isRightOption ? "text-success" : "text-danger"
            )}
          >
            {isRightOption ? (
              <Check size={14} strokeWidth={2.5} />
            ) : (
              <X size={14} strokeWidth={2.5} />
            )}
            Correct answer: {String(option.answer)}
          </span>
        )}
      </div>
      <div
        className="flex gap-2 max-md:gap-1.5 justify-end"
        role="radiogroup"
        aria-label={option.value}
      >
        {[true, false].map((value) => (
          <button
            key={String(value)}
            type="button"
            role="radio"
            aria-checked={selectedOption === value}
            aria-label={optionLabel(value)}
            disabled={submitted}
            onClick={() => handleChoose(value)}
            className={buttonClassName(value)}
          >
            {value ? (
              <Check size={18} strokeWidth={2.4} />
            ) : (
              <X size={18} strokeWidth={2.4} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MultipleTrueFalseItem;
