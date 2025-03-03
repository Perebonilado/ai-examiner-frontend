import AIIcon from "@/icons/AIIcon";
import ChevronDown from "@/icons/ChevronDown";
import React, { FC, useState } from "react";
import cn from "classnames";
import VivaAnalysisItem from "./VivaSystemResponse";
import VivaUserResponse from "./VivaUserResponse";
import VivaSystemResponse from "./VivaSystemResponse";

const VivaAnalysisItemAccordion: FC = () => {
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
        className="flex cursor-pointer"
        onClick={() => {
          setIsExpanded(!isExpanded);
        }}
      >
        <div className="flex items-center" style={{ flex: 1 }}>
          <AIIcon />
        </div>
        <div style={{ flex: 10 }}>
          <div>
            <p className="flex items-center gap-4">
              <span className="font-semibold text-[#00000080]">Examiner</span>
              <span className="text-[#00000080]">|</span>
              <span className="text-xl text-[#9A67E2]">Question 1 of 4</span>
            </p>
          </div>
          <p className="mt-3 text-sm">
            What is the function of the lens in the eye?
          </p>
        </div>
        <button style={{ flex: 1 }}>
          <ChevronDown />
        </button>
      </div>

      <div className={expClassName}>
        <VivaUserResponse
          grade="fail"
          userResponse="The lens remains rigid, preventing any adjustment for focusing light, resulting in blurred vision regardless of distance."
        />
        <VivaSystemResponse systemResponse="Your answer is wrong because the lens is flexible and changes shape to help focus light rays onto the retina, aiding in both near and distant vision." />
      </div>
    </div>
  );
};

export default VivaAnalysisItemAccordion;
