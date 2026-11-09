import { QuestionOption } from "@/models/questions.model";
import React, { FC } from "react";
import cn from "classnames";
import { Check, X } from "lucide-react";

interface Props {
  option: QuestionOption;
  isChecked: boolean;
  handleChecked: (option: QuestionOption) => void;
  submitted: boolean;
  isRightOption: boolean;
  /** Letter key shown at the start of the row (A–D). */
  letter?: string;
}

const MCQOption: FC<Props> = ({
  option,
  isChecked,
  handleChecked,
  submitted,
  isRightOption,
  letter,
}) => {
  const isRight = submitted && isRightOption;
  const isWrong = submitted && !isRightOption && isChecked;
  const isDim = submitted && !isRight && !isWrong;
  const isSelected = isChecked && !submitted;

  const statusClass = cn(
    "group flex items-center gap-3.5 w-full min-h-[54px] px-3.5 py-3 rounded-xl border-[1.5px] text-left text-[15px] leading-[1.45]",
    "max-md:gap-3 max-md:min-h-[52px] max-md:px-3 max-md:py-[11px] max-md:text-[14.5px]",
    "transition-[border-color,background-color,color] duration-150",
    {
      ["border-edge bg-surface text-body hover:border-accent-300 hover:bg-canvas"]:
        !submitted && !isChecked,
      ["border-accent bg-accent-50 text-ink"]: isSelected,
      ["border-success bg-success-bg text-success-strong font-semibold"]: isRight,
      ["border-danger bg-danger-bg text-danger-strong"]: isWrong,
      ["border-edge bg-surface text-body opacity-60"]: isDim,
      ["cursor-default"]: submitted,
    }
  );

  const keyClass = cn(
    "w-7 h-7 rounded-lg grid place-items-center shrink-0 text-[12.5px] font-bold transition-colors duration-150",
    {
      ["bg-sunken text-subtle group-hover:bg-accent-100 group-hover:text-accent-900"]:
        !submitted && !isChecked,
      ["bg-accent text-on-accent"]: isSelected,
      ["bg-success text-on-success"]: isRight,
      ["bg-danger text-on-danger"]: isWrong,
      ["bg-sunken text-subtle"]: isDim,
    }
  );

  return (
    <button
      type="button"
      aria-pressed={!submitted ? isChecked : undefined}
      disabled={submitted}
      onClick={() => {
        if (!submitted) handleChecked(option);
      }}
      className={statusClass}
    >
      {letter && <span className={keyClass}>{letter}</span>}
      <span className="flex-1 min-w-0">{option.value}</span>
      {(isRight || isWrong) && (isChecked || isRight) && (
        <span className="ml-auto flex items-center gap-1.5 shrink-0 text-xs font-bold">
          {isRight ? (
            <Check size={16} strokeWidth={2} />
          ) : (
            <X size={16} strokeWidth={2} />
          )}
          {isChecked ? "Your answer" : "Correct"}
        </span>
      )}
    </button>
  );
};

export default MCQOption;
