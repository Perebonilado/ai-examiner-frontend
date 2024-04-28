import React, { FC, useEffect, useState } from "react";
import MCQItemContainer from "./MCQItemContainer";
import { mockQuestions } from "@/constants";

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
