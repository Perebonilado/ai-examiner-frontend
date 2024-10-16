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
  allowSaveProgress?: boolean;
  allowSaveScore?: boolean;
  allowNotSure?: boolean;
}

const MCQContainer: FC<Props> = ({
  data,
  handleDone,
  documentId,
  title,
  isSubmitted,
  handleSubmitted,
  allowSaveProgress = true,
  allowNotSure = true,
  allowSaveScore = true
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
        allowSaveProgress={allowSaveProgress}
        allowNotSure={allowNotSure}
        allowSaveScore={allowSaveScore}
      />
    </section>
  );
};

export default MCQContainer;
