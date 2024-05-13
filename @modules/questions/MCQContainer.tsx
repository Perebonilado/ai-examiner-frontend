import React, { FC, useEffect, useState } from "react";
import MCQItemContainer from "./MCQItemContainer";
import { QuestionsModel } from "@/models/questions.model";

interface Props {
  data: QuestionsModel[];
  handleDone: () => void;
}

const MCQContainer: FC<Props> = ({ data, handleDone }) => {
  return (
    <section>
      <MCQItemContainer
        data={data}
        handleDone={handleDone}
      />
    </section>
  );
};

export default MCQContainer;
