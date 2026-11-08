import React, { forwardRef } from "react";
import Button from "@/@shared/ui/Button";
import { useModalContext } from "@/contexts/ModalContext";
import { generateDocumentCardColorFromScore } from "@/utils";
import { X } from "lucide-react";

interface Props {
  scorePercentage: number;
  title: string;
  handleScrollToTop: () => void;
  allowPerformanceOverview?: boolean;
  handlePerformanceOverview?: () => void;
}

const sentenceCase = (text?: string) =>
  text ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() : "";

// Strip the trailing emoji from the shared score copy; the ring carries the tone.
const plainText = (text?: string) =>
  text ? text.replace(/[\s -㌀\uD800-\uDFFF️]+$/, "") : "";

const SubmissionModal = forwardRef<HTMLDivElement, Props>(
  ({ allowPerformanceOverview = false, ...props }, ref) => {
    const color = generateDocumentCardColorFromScore(props.scorePercentage);

    const { setModalContent } = useModalContext();

    const score = props.scorePercentage;
    const ringColor =
      score >= 80
        ? "var(--success)"
        : score >= 50
        ? "var(--warning)"
        : "var(--danger)";
    const r = 52;
    const circumference = 2 * Math.PI * r;
    const clamped = Math.max(0, Math.min(100, score));

    return (
      <div
        ref={ref}
        role="dialog"
        aria-labelledby="submission-title"
        className="w-full relative max-w-[400px] max-md:max-w-[92vw] rounded-2xl shadow-pop border border-edge bg-surface px-6 pt-7 pb-[22px] text-center"
      >
        <button
          type="button"
          aria-label="Close"
          className="absolute top-2.5 right-2.5 w-9 h-9 grid place-items-center rounded-lg text-subtle hover:bg-hover hover:text-ink transition-colors"
          onClick={() => {
            setModalContent(null);
          }}
        >
          <X size={18} strokeWidth={1.75} />
        </button>

        <p className="px-8 text-[13px] font-semibold text-subtle truncate">
          {props.title}
        </p>

        <div
          className="relative w-[136px] h-[136px] mx-auto mt-[18px]"
          role="img"
          aria-label={`Score ${score.toFixed()}%`}
        >
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke="var(--sunken)"
              strokeWidth="10"
            />
            <circle
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke={ringColor}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (clamped / 100) * circumference}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[32px] font-extrabold tracking-[-0.03em] text-ink tabular-nums">
            {score.toFixed()}
            <small className="text-lg font-bold text-subtle mt-1.5 ml-px">%</small>
          </span>
        </div>

        <h2
          id="submission-title"
          className="mt-[18px] text-xl font-bold text-ink tracking-[-0.02em]"
        >
          {sentenceCase(color.message)}
        </h2>
        <p className="mt-1.5 text-[15px] leading-normal text-subtle">
          {plainText(color.subMessage)}
        </p>

        <div className="mt-[22px] flex flex-col gap-2.5">
          <Button
            title="Review answers"
            onClick={() => {
              setModalContent(null);
              props.handleScrollToTop();
            }}
            fullWidth
            size="large"
          />
          {allowPerformanceOverview && props.handlePerformanceOverview && (
            <Button
              title="Performance overview"
              fullWidth
              onClick={props.handlePerformanceOverview}
              variant="outlined"
              size="large"
            />
          )}
        </div>
      </div>
    );
  }
);

export default SubmissionModal;
