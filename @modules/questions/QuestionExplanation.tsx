import Button from "@/@shared/ui/Button";
import ChevronDown from "@/icons/ChevronDown";
import React, { FC, useState } from "react";
import cn from "classnames";

interface Props {
  explanation: string;
  allowViewSource?: boolean;
  handleViewSource?: () => void;
}

const QuestionExplanation: FC<Props> = ({
  explanation,
  allowViewSource = false,
  handleViewSource,
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
    <>
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="w-full max-w-[200px]">
          <Button
            title={!isExpanded ? "Show Explanation" : "Hide Explanation"}
            variant="text"
            fullWidth
            className="!bg-transparent"
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
        </div>
        <div className={expClassName}>
          <p className="text-sm font-semibold ">{explanation}</p>
          {allowViewSource && <div className="flex justify-end w-full mt-6">
            <Button
              title="View Source"
              className="!bg-transparent"
              variant="outlined"
              onClick={()=>{
                if(handleViewSource) handleViewSource()
              }}
            />
          </div>}
        </div>
      </div>
    </>
  );
};

export default QuestionExplanation;
