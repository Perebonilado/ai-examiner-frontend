import Button from "@/@shared/ui/Button";
import ChevronDown from "@/icons/ChevronDown";
import React, { FC, useState } from "react";
import cn from "classnames";
import ChevronRight from "@/icons/ChevronRight";

interface Props {
  explanation: string;
}

const QuestionExplanation: FC<Props> = ({ explanation }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const expClassName = cn("transition-max-h duration-500 ease-in-out overflow-hidden", {
    ["max-h-0"]: !isExpanded,
    ["max-h-[1500px]"]: isExpanded,
  });

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <Button
        title={!isExpanded ? "Show Explanation" : "Hide Explanation"}
        variant="text"
        size="small"
        endicon={
          !isExpanded ? (
            <ChevronDown />
          ) : (
            <span className="rotate-180">
              <ChevronDown />
            </span>
          )
        }
        onClick={() => setIsExpanded(!isExpanded)}
      />
      <div className={expClassName}>
        <p className="text-sm font-semibold ">{explanation}</p>
      </div>
    </div>
  );
};

export default QuestionExplanation;
