import React, { FC, useState } from "react";
import cn from "classnames";
import { ArrowLeft, ArrowRight } from "lucide-react";
import FlashCardItem from "./FlashCardItem/FlashCardItem";
import Button from "@/@shared/ui/Button";

interface Props {
  data: { question: string; answer: string; hint?: string }[];
  handleDone: () => void;
  handleGenerateMoreQuestions?: () => void;
  allowMoreQuestionGeneration?: boolean;
}

const navButton =
  "w-10 h-10 rounded-full grid place-items-center border border-control bg-surface text-subtle transition-colors hover:bg-hover hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-bright disabled:opacity-40 disabled:cursor-default disabled:hover:bg-surface disabled:hover:text-subtle";

const FlashCardItemContainer: FC<Props> = ({
  data,
  handleDone,
  handleGenerateMoreQuestions,
  allowMoreQuestionGeneration = false,
}) => {
  const [currIndex, setCurrIndex] = useState(0);

  return (
    <section className="w-full">
      {data.map((d, idx) => {
        if (idx === currIndex)
          return (
            <FlashCardItem {...d} index={idx} total={data.length} key={idx} />
          );
      })}

      <div
        role="progressbar"
        aria-label="Card progress"
        aria-valuemin={1}
        aria-valuemax={data.length}
        aria-valuenow={currIndex + 1}
        className="flex gap-1 mt-10 max-md:mt-8"
      >
        {data.map((_, idx) => (
          <span
            key={idx}
            className={cn("flex-1 h-1.5 rounded-full", {
              "bg-accent": idx < currIndex,
              "bg-accent-900": idx === currIndex,
              "bg-sunken": idx > currIndex,
            })}
          />
        ))}
      </div>

      <div className="flex items-center justify-center gap-4 mt-3.5">
        <button
          type="button"
          aria-label="Previous card"
          className={navButton}
          disabled={currIndex === 0}
          onClick={() => {
            if (currIndex > 0) {
              setCurrIndex((prev) => prev - 1);
            }
          }}
        >
          <ArrowLeft size={18} strokeWidth={1.75} aria-hidden />
        </button>
        <span className="min-w-14 text-center text-[15px] font-bold text-ink tabular-nums">
          {currIndex + 1}
          <span className="font-semibold text-muted">/{data.length}</span>
        </span>
        <button
          type="button"
          aria-label="Next card"
          className={navButton}
          disabled={currIndex >= data.length - 1}
          onClick={() => {
            if (currIndex < data.length - 1) {
              setCurrIndex((prev) => prev + 1);
            }
          }}
        >
          <ArrowRight size={18} strokeWidth={1.75} aria-hidden />
        </button>
      </div>

      <div data-phone-bottom-bar="" className="flex justify-end gap-2.5 mt-8 max-md:sticky max-md:bottom-0 max-md:z-10 max-md:-mx-4 max-md:mt-6 max-md:px-4 max-md:pt-3 max-md:pb-[calc(12px+env(safe-area-inset-bottom))] max-md:border-t max-md:border-line max-md:bg-surface-glass max-md:backdrop-blur-md">
        {allowMoreQuestionGeneration && (
          <Button
            title="New test"
            onClick={() => {
              if (handleGenerateMoreQuestions) {
                handleGenerateMoreQuestions();
              }
            }}
            size="large"
            variant="outlined"
            className="max-md:flex-1"
          />
        )}
        <Button
          title="Done"
          size="large"
          onClick={handleDone}
          className="min-w-[160px] max-md:min-w-0 max-md:flex-1"
        />
      </div>
    </section>
  );
};

export default FlashCardItemContainer;
