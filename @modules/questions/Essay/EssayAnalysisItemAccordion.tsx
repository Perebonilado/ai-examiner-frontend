import { EssayQuestionModel } from "@/models/questions.model";
import React, { FC } from "react";
import VivaAnalysisItemAccordion from "../VivaAnalysisItemAccordion";

interface Props extends EssayQuestionModel {
  questionNumber: number;
  totalQuestions: number;
}

/* Same marked-question accordion as the viva analysis, fed with the essay's answer and analysis. */
const EssayAnalysisItemAccordion: FC<Props> = ({
  analysis,
  answer,
  question,
  score,
  questionNumber,
  totalQuestions,
}) => {
  return (
    <VivaAnalysisItemAccordion
      question={question}
      questionNumber={questionNumber}
      totalQuestions={totalQuestions}
      grade={score >= 5 ? "pass" : "fail"}
      userResponse={answer}
      systemResponse={analysis}
      score={score}
    />
  );
};

export default EssayAnalysisItemAccordion;
