import ChevronDown from "@/icons/ChevronDown";
import React, { FC, useState } from "react";
import cn from "classnames";
import VivaUserResponse from "./VivaUserResponse";
import VivaSystemResponse from "./VivaSystemResponse";
import { VivaAnalysisModel } from "@/models/viva.model";
import ArticifialIntelligenceIcon from "@/icons/ArticifialIntelligenceIcon";

interface Props extends VivaAnalysisModel {}

const VivaAnalysisItemAccordion: FC<Props> = ({
  question,
  questionNumber,
  totalQuestions,
  grade,
  systemResponse,
  userResponse,
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
        className="flex cursor-pointer gap-3"
        onClick={() => {
          setIsExpanded(!isExpanded);
        }}
      >
        <div className="flex items-center" style={{ flex: 1 }}>
          <ArticifialIntelligenceIcon />
        </div>
        <div style={{ flex: 10 }}>
          <div>
            <p className="flex items-center gap-4">
              <span className="font-semibold text-[#00000080]">Examiner</span>
              <span className="text-[#00000080]">|</span>
              <span className="text-xl text-[#00000080]">
                Question {questionNumber} of {totalQuestions}
              </span>
            </p>
          </div>
          <p className="mt-3 text-sm">{question}</p>
        </div>
        <button style={{ flex: 1 }}>
          <ChevronDown />
        </button>
      </div>

      <div className={expClassName}>
        <VivaUserResponse grade={grade} userResponse={userResponse} />
        <VivaSystemResponse systemResponse={systemResponse} />
      </div>
    </div>
  );
};

export default VivaAnalysisItemAccordion;
