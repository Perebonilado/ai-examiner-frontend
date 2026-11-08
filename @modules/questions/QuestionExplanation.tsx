import React, { FC, useState } from "react";
import { ChevronDown, ChevronUp, FileSearch, Lightbulb } from "lucide-react";
import { linkButtonClassName } from "./TestUI";

interface Props {
  explanation: string;
  allowViewSource?: boolean;
  handleViewSource?: () => void;
}

/** After submit: a flat well with the explanation, toggled from the card footer. */
const QuestionExplanation: FC<Props> = ({
  explanation,
  allowViewSource = false,
  handleViewSource,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {isExpanded && (
        <div className="mt-3.5 rounded-xl bg-well px-4 py-3.5 max-md:px-3.5 max-md:py-3">
          <p className="flex items-center gap-2 text-[13px] font-bold text-ink">
            <Lightbulb size={16} strokeWidth={1.75} className="text-accent" />
            Explanation
          </p>
          <p className="mt-1.5 text-sm leading-[1.65] text-body max-w-[68ch] whitespace-pre-line">
            {explanation}
          </p>
          {allowViewSource && (
            <div className="mt-2.5 flex justify-end">
              <button
                type="button"
                className={`${linkButtonClassName} !ml-0`}
                onClick={() => {
                  if (handleViewSource) handleViewSource();
                }}
              >
                <FileSearch size={16} strokeWidth={1.75} />
                View source
              </button>
            </div>
          )}
        </div>
      )}
      <div className="mt-3.5 pt-3 border-t border-dashed border-line flex items-center justify-between gap-2">
        <button
          type="button"
          className={linkButtonClassName}
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronUp size={16} strokeWidth={1.75} />
          ) : (
            <ChevronDown size={16} strokeWidth={1.75} />
          )}
          {isExpanded ? "Hide explanation" : "Show explanation"}
        </button>
      </div>
    </>
  );
};

export default QuestionExplanation;
