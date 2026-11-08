import { QuestionsModel } from "@/models/questions.model";
import React, { FC } from "react";
import EssayQuestion from "./EssayQuestion";
import { SpeechButtonWithProgress } from "@/@shared/components/SpeechButtonWithProgress";

interface Props extends QuestionsModel {
  questionNumber: number;
  totalQuestionsCount: number;
  documentId: string;
  speak: (text: string) => void;
  handleSetAnswer: ({ id, answer }: { id: string; answer: string }) => void;
}

const EssayItem: FC<Props> = ({
  id,
  question,
  questionNumber,
  totalQuestionsCount,
  handleSetAnswer,
}) => {
  const answerId = `essay-answer-${id}`;
  return (
    <article className="w-full rounded-2xl border border-edge bg-surface px-6 pt-[22px] pb-6 shadow-xs transition-[border-color,box-shadow] duration-150 focus-within:border-control focus-within:shadow-lift max-md:rounded-[14px] max-md:px-4 max-md:pt-[18px] max-md:pb-4">
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <p className="text-xs font-medium text-muted tabular-nums">
          {questionNumber} of {totalQuestionsCount}
        </p>
        <div className="-my-1.5 -mr-1.5">
          <SpeechButtonWithProgress question={question} />
        </div>
      </div>
      <div className="mt-1 mb-[18px] max-w-[64ch] text-[17px] leading-[1.55] font-semibold tracking-[-0.01em] text-ink max-md:text-base">
        <EssayQuestion question={question} />
      </div>
      <label className="sr-only" htmlFor={answerId}>
        Your answer to question {questionNumber}
      </label>
      <textarea
        id={answerId}
        rows={10}
        placeholder="Enter your answer here"
        onChange={(e) => {
          const value = e.target.value;
          if (value.trim()) {
            handleSetAnswer({ id, answer: value });
          }
        }}
        className="block w-full resize-y rounded-[10px] border border-control bg-surface px-3.5 py-3 text-[15px] leading-[1.65] text-ink shadow-xs outline-none transition-[border-color,box-shadow] placeholder:text-faint hover:border-[#c9c8d0] focus:border-accent-bright focus:ring-4 focus:ring-[rgba(124,58,237,0.14)]"
      ></textarea>
    </article>
  );
};

export default EssayItem;
