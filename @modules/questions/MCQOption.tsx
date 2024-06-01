import Checkbox from "@/@shared/ui/Input/Checkbox/Checkbox";
import { QuestionOption } from "@/models/questions.model";
import React, { FC } from "react";
import cn from "classnames";

interface Props {
  option: QuestionOption;
  isChecked: boolean;
  handleChecked: (option: QuestionOption) => void;
  submitted: boolean;
  isRightOption: boolean;
}

const MCQOption: FC<Props> = ({
  option,
  isChecked,
  handleChecked,
  submitted,
  isRightOption,
}) => {
  const statusClass = cn(
    `border-2 border-gray-200 min-h-[50px] rounded-[12px] p-4 bg-white flex items-center`,
    {
      ["hover:border-[#9370DB] cursor-pointer"]: !submitted,
      ["!bg-[#9370DB] text-white !border-[#9370DB]"]: isChecked && !submitted,
      ["!border-[#c3e6cb] text-[#155724] !bg-[#d4edda]"]:
        submitted && isRightOption,
      ["!border-[#f5c6cb] text-[#721c24] !bg-[#f8d7da]"]:
        submitted && !isRightOption && isChecked,
    }
  );

  return (
    <div
      onClick={() => {
        if (!submitted) handleChecked(option);
      }}
      className={statusClass}
    >
      <p>{option.value}</p>
    </div>
  );
};

export default MCQOption;
