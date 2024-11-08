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
  handleShowSubmissionModal: ({
    title,
    score,
  }: {
    title: string;
    score: number;
  }) => void;
  handleGenerateMoreQuestions?: () => void;
  allowMoreQuestionGeneration?: boolean;
  allowSaveProgress?: boolean;
  allowSaveScore?: boolean;
  allowNotSure?: boolean;
  allowViewSource?: boolean;
}

const MCQContainer: FC<Props> = ({
  data,
  handleDone,
  documentId,
  title,
  isSubmitted,
  handleSubmitted,
  handleShowSubmissionModal,
  handleGenerateMoreQuestions,
  allowSaveProgress = true,
  allowNotSure = true,
  allowSaveScore = true,
  allowViewSource = true,
  allowMoreQuestionGeneration = false,
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
        handleShowSubmissionModal={handleShowSubmissionModal}
        handleGenerateMoreQuestions={handleGenerateMoreQuestions}
        allowMoreQuestionGeneration={allowMoreQuestionGeneration}
        allowSaveProgress={allowSaveProgress}
        allowNotSure={allowNotSure}
        allowSaveScore={allowSaveScore}
        allowViewSource={allowViewSource}
      />
    </section>
  );
};

export default MCQContainer;
