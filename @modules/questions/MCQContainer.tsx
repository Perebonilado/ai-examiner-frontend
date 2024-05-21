import React, { FC } from "react";
import MCQItemContainer from "./MCQItemContainer";
import { QuestionsModel } from "@/models/questions.model";

interface Props {
  data: QuestionsModel[];
  handleDone: () => void;
  documentId: string;
  title: string
}

const MCQContainer: FC<Props> = ({ data, handleDone, documentId, title }) => {
  return (
    <section>
      <MCQItemContainer
        data={data}
        handleDone={handleDone}
        documentId={documentId}
        title={title}
      />
    </section>
  );
};

export default MCQContainer;
