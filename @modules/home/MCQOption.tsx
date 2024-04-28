import Checkbox from "@/@shared/ui/Input/Checkbox/Checkbox";
import { QuestionOption } from "@/models/questions.model";
import React, { FC } from "react";

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
  return (
    <div>
      <Checkbox
        checked={isChecked}
        onChange={() => {
          if (!submitted) handleChecked(option);
        }}
        label={option.value}
        customBorderColor={
          submitted && isRightOption && !isChecked ? "green" : ""
        }
        customLabelColor={
          submitted && isRightOption && !isChecked ? "green" : ""
        }
      />
    </div>
  );
};

export default MCQOption;
