import React, { FC, useEffect, useState } from "react";
import MCQItemContainer from "./MCQItemContainer";
import { QuestionsModel } from "@/models/questions.model";

interface Props {
  data: QuestionsModel[];
  handeGenerateNewQuestions: () => void;
}

const MCQContainer: FC<Props> = ({ data, handeGenerateNewQuestions }) => {
  return (
    <section>
      <MCQItemContainer
        data={data}
        handeGenerateNewQuestions={handeGenerateNewQuestions}
      />
    </section>
  );
};

export default MCQContainer;
