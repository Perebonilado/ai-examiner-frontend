import Checkbox from "@/@shared/ui/Input/Checkbox/Checkbox";
import { QuestionOption } from "@/models/questions.model";
import React, { FC } from "react";

interface Props {
  option: QuestionOption;
  isChecked: boolean;
  handleChecked: (option: QuestionOption) => void;
}

const MCQOption: FC<Props> = ({ option, isChecked, handleChecked }) => {
  return (
    <div>
      <Checkbox
        checked={isChecked}
        onChange={() => {
          handleChecked(option);
        }}
        label={option.value}
      />
    </div>
  );
};

export default MCQOption;
