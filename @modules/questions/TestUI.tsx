/* Shared presentational pieces for the multiple-choice and true/false test screens. */
import React, { FC, PropsWithChildren, ReactNode } from "react";
import cn from "classnames";
import { ChartNoAxesColumn, CircleCheck, CircleX, Plus, RotateCcw } from "lucide-react";
import Button from "@/@shared/ui/Button";
import { SpeechButtonWithProgress } from "@/@shared/components/SpeechButtonWithProgress";

export const linkButtonClassName =
  "inline-flex items-center gap-[7px] h-8 px-2.5 -ml-2.5 rounded-lg text-[13px] font-semibold text-accent hover:bg-hover hover:text-accent-900 transition-colors";

/** White question card with a hairline border. */
export const QuestionCard: FC<PropsWithChildren<{ className?: string }>> = ({
  children,
  className,
}) => (
  <article
    className={cn(
      "w-full bg-surface border border-edge rounded-2xl shadow-xs px-6 pt-[22px] pb-[18px]",
      "max-md:rounded-[14px] max-md:px-4 max-md:pt-[18px] max-md:pb-3.5",
      className
    )}
  >
    {children}
  </article>
);

/** Top row of a question card: "n of N" (or the verdict after submit) + read-aloud. */
export const QuestionCardTop: FC<{ left: ReactNode; speakText: string }> = ({
  left,
  speakText,
}) => (
  <div className="flex items-center justify-between gap-3 mb-1.5 min-h-9">
    {left}
    <ReadAloudButton text={speakText} />
  </div>
);

export const QuestionCount: FC<{ number: number; total: number }> = ({
  number,
  total,
}) => (
  <span className="text-xs font-medium text-muted tabular-nums">
    {number} of {total}
  </span>
);

export const Verdict: FC<{ isRight: boolean; label: string }> = ({
  isRight,
  label,
}) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 text-[13px] font-bold tabular-nums",
      isRight ? "text-success" : "text-danger"
    )}
  >
    {isRight ? (
      <CircleCheck size={16} strokeWidth={1.75} />
    ) : (
      <CircleX size={16} strokeWidth={1.75} />
    )}
    {label}
  </span>
);

export const QuestionText: FC<PropsWithChildren> = ({ children }) => (
  <p className="mt-1 mb-[18px] max-w-[64ch] text-[17px] max-md:text-base leading-[1.55] font-semibold text-ink tracking-[-0.01em]">
    {children}
  </p>
);

/** Read-aloud: the shared 36px ghost icon button, nudged to the card's right edge. */
export const ReadAloudButton: FC<{ text: string }> = ({ text }) => (
  <div className="-my-1.5 -mr-1.5 shrink-0">
    <SpeechButtonWithProgress question={text} />
  </div>
);

/** Score ring with the percentage inside (result row). */
export const ScoreRing: FC<{ percentage: number; size?: number }> = ({
  percentage,
  size = 56,
}) => {
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, percentage));
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      className="shrink-0"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--sunken)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c - (clamped / 100) * c}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-ink text-[13px] font-bold tabular-nums"
      >
        {Math.round(percentage)}%
      </text>
    </svg>
  );
};

interface ResultRowProps {
  percentage: number;
  correct: number;
  total: number;
  handleRestart?: () => void;
  handleNewTest?: () => void;
  handleViewScore: () => void;
}

/** Minimal result row after submitting: ring, "16 of 20 correct", Restart / New test / View score. */
export const ResultRow: FC<ResultRowProps> = ({
  percentage,
  correct,
  total,
  handleRestart,
  handleNewTest,
  handleViewScore,
}) => (
  <section
    aria-label="Your score"
    className="flex items-center justify-between gap-5 pt-1.5 pb-[22px] mb-[26px] border-b border-line max-md:flex-col max-md:items-stretch max-md:gap-4"
  >
    <div className="flex items-center gap-4">
      <ScoreRing percentage={percentage} />
      <div className="tabular-nums">
        <b className="block text-[17px] font-bold text-ink tracking-[-0.01em]">
          {correct} of {total} correct
        </b>
        <span className="block mt-[3px] text-[13px] text-subtle">
          {Math.max(0, total - correct)} to review
        </span>
      </div>
    </div>
    <div className="flex flex-wrap gap-2">
      {handleRestart && (
        <Button
          title="Restart"
          size="small"
          variant="contained"
          className="max-md:flex-1 !gap-1.5"
          starticon={<RotateCcw size={16} strokeWidth={1.75} />}
          onClick={handleRestart}
        />
      )}
      {handleNewTest && (
        <Button
          title="New test"
          size="small"
          variant="outlined"
          className="max-md:flex-1 !gap-1.5"
          starticon={<Plus size={16} strokeWidth={1.75} />}
          onClick={handleNewTest}
        />
      )}
      <Button
        title="View score"
        size="small"
        variant="outlined"
        className="max-md:flex-1 !gap-1.5"
        starticon={<ChartNoAxesColumn size={16} strokeWidth={1.75} />}
        onClick={handleViewScore}
      />
    </div>
  </section>
);

/** Bottom action bar: right-aligned on desktop, a sticky full-width bar on phones. */
export const ActionBar: FC<PropsWithChildren> = ({ children }) => (
  <div
    data-phone-bottom-bar=""
    className={cn(
      "flex justify-end gap-2.5 mt-8",
      "max-md:sticky max-md:bottom-0 max-md:z-20 max-md:mt-6 max-md:-mx-4 max-md:-mb-12",
      "max-md:px-4 max-md:pt-3 max-md:pb-[calc(12px+env(safe-area-inset-bottom))]",
      "max-md:bg-white/95 max-md:backdrop-blur-md max-md:border-t max-md:border-line",
      "max-md:[&>button]:flex-1"
    )}
  >
    {children}
  </div>
);

export const actionButtonClassName = "md:min-w-[160px]";
