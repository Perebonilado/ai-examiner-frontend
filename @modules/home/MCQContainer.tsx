import React, { FC } from "react";
import MCQItemContainer from "./MCQItemContainer";
import { mockQuestions } from "@/constants";
import { generateAlphabets } from "@/utils";

const MCQContainer: FC = () => {
  return (
    <section>
      <MCQItemContainer
        data={mockQuestions.map((d) => ({ answerId: d.correctAnswerId, ...d }))}
      />
    </section>
  );
};

export default MCQContainer;
