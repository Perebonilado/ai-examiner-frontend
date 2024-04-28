import React, { FC, useEffect, useState } from "react";
import MCQItemContainer from "./MCQItemContainer";
import { QuestionsModel } from "@/models/questions.model";

interface Props {
  data: QuestionsModel[];
}

const MCQContainer: FC<Props> = ({ data }) => {
  return (
    <section>
      <MCQItemContainer data={data} />
    </section>
  );
};

export default MCQContainer;
