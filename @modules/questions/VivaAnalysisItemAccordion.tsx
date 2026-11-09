import React, { FC, useId, useState } from "react";
import cn from "classnames";
import { ChevronDown } from "lucide-react";
import VivaUserResponse from "./VivaUserResponse";
import VivaSystemResponse from "./VivaSystemResponse";
import { VivaAnalysisModel } from "@/models/viva.model";

interface Props extends VivaAnalysisModel {}

/* One marked question: the examiner's question, folded; open it for your response and the evaluation. */
const VivaAnalysisItemAccordion: FC<Props> = ({
  question,
  questionNumber,
  totalQuestions,
  grade,
  systemResponse,
  userResponse,
  score,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const bodyId = `analysis-${useId().replace(/:/g, "")}`;

  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border bg-surface transition-[border-color,box-shadow] duration-150 max-md:rounded-[14px]",
        isExpanded ? "border-control shadow-lift" : "border-edge shadow-xs"
      )}
    >
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls={bodyId}
        onClick={() => {
          setIsExpanded(!isExpanded);
        }}
        className="flex w-full items-start gap-3.5 px-5 py-[18px] text-left transition-colors hover:bg-canvas focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent-bright max-md:gap-3 max-md:p-4"
      >
        <span
          aria-hidden
          className="mt-px grid h-[30px] w-[30px] shrink-0 place-items-center rounded-[9px] bg-brand text-[13px] font-extrabold tracking-[-0.03em] text-white shadow-[inset_0_-2px_0_rgba(0,0,0,0.18)]"
        >
          AI
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 text-xs font-semibold text-muted">
            <b className="font-bold text-ink">Examiner</b>
            <span aria-hidden className="inline-block h-3 w-px bg-control" />
            <span className="tabular-nums">
              Question {questionNumber} of {totalQuestions}
            </span>
          </span>
          <span
            className={cn(
              "mt-[3px] max-w-[62ch] text-base font-semibold leading-normal tracking-[-0.01em] text-ink max-md:text-[15px]",
              isExpanded ? "block" : "line-clamp-2"
            )}
          >
            {question}
          </span>
        </span>
        <span className="ml-auto flex shrink-0 items-center gap-2.5 pt-1">
          {!isExpanded && (
            <span
              aria-label={`Score: ${score} out of 10`}
              className={cn(
                "inline-flex h-[26px] items-center rounded-full px-2.5 text-[13px] font-bold tabular-nums",
                {
                  "bg-success-bg text-success-strong": grade === "pass",
                  "bg-danger-bg text-danger-strong": grade === "fail",
                }
              )}
            >
              {score}
              <small className="text-[11.5px] font-medium">
                /10
              </small>
            </span>
          )}
          <ChevronDown
            size={18}
            strokeWidth={1.75}
            aria-hidden
            className={cn(
              "text-muted transition-transform duration-200 motion-reduce:transition-none",
              { "rotate-180": isExpanded }
            )}
          />
        </span>
      </button>

      <div
        id={bodyId}
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out-expo motion-reduce:transition-none",
          isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
        {...((isExpanded ? {} : { inert: "" }) as Record<string, unknown>)}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="flex flex-col gap-3 pb-5 pl-16 pr-5 max-md:px-4 max-md:pb-4">
            <VivaUserResponse
              grade={grade}
              userResponse={userResponse}
              score={score}
            />
            <VivaSystemResponse systemResponse={systemResponse} />
          </div>
        </div>
      </div>
    </article>
  );
};

export default VivaAnalysisItemAccordion;
