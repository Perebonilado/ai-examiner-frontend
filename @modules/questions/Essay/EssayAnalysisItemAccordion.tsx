import { EssayQuestionModel } from "@/models/questions.model";
import React, { FC, useState } from "react";
import cn from "classnames";
import ArticifialIntelligenceIcon from "@/icons/ArticifialIntelligenceIcon";
import ChevronDown from "@/icons/ChevronDown";
import VivaUserResponse from "../VivaUserResponse";
import VivaSystemResponse from "../VivaSystemResponse";

interface Props extends EssayQuestionModel {
  questionNumber: number;
  totalQuestions: number;
}

const EssayAnalysisItemAccordion: FC<Props> = ({
  analysis,
  answer,
  createdOn,
  id,
  question,
  questionId,
  score,
  status,
  questionNumber,
  totalQuestions,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const expClassName = cn(
    "transition-max-h duration-500 ease-in-out overflow-hidden",
    {
      ["max-h-0"]: !isExpanded,
      ["max-h-[1500px]"]: isExpanded,
    }
  );
  return (
    <div className="border-y py-4">
      <div
        className="flex cursor-pointer "
        onClick={() => {
          setIsExpanded(!isExpanded);
        }}
      >
        <div className="flex items-start pr-3">
          <ArticifialIntelligenceIcon />
        </div>
        <div style={{ flex: 10 }}>
          <div>
            <p className="flex items-center gap-4">
              <span className="font-semibold text-[#00000080]">Examiner</span>
              <span className="text-[#00000080]">|</span>
              <span className="text-[#00000080]">
                Question {questionNumber} of {totalQuestions}
              </span>
            </p>
          </div>
          <p className="mt-3 text-sm">{question}</p>
        </div>
        <button style={{ flex: 1 }} className="px-4">
          <ChevronDown />
        </button>
      </div>

      <div className={expClassName}>
        <VivaUserResponse
          grade={score >= 5 ? "pass" : "fail"}
          userResponse={answer}
          score={score}
        />
        <VivaSystemResponse systemResponse={analysis} />
      </div>
    </div>
  );
};

export default EssayAnalysisItemAccordion;
