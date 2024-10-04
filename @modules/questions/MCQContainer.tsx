import React, { FC } from "react";
import MCQItemContainer from "./MCQItemContainer";
import { QuestionsModel } from "@/models/questions.model";

interface Props {
  data: QuestionsModel[];
  handleDone: () => void;
  documentId: string;
  title: string;
  isSubmitted: boolean;
  handleSubmitted: (value: boolean) => void;
}

const MCQContainer: FC<Props> = ({
  data,
  handleDone,
  documentId,
  title,
  isSubmitted,
  handleSubmitted,
}) => {
  return (
    <section>
      <MCQItemContainer
        data={data}
        handleDone={handleDone}
        documentId={documentId}
        title={title}
        isSubmitted={isSubmitted}
        handleSubmitted={handleSubmitted}
      />
    </section>
  );
};

export default MCQContainer;
