import React, { FC, FormEvent, useEffect, useState } from "react";
import cn from "classnames";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { FeedbackKind, useRateMutation } from "@/api-services/feedback.service";

interface Props {
  kind: FeedbackKind;
  itemId: string;
  /** The student's earlier rating, when known (1 or -1). */
  initial?: number;
  /** Shown before the thumbs, e.g. "Was this test useful?". Icons only when left out. */
  question?: string;
  /** What the thumbs rate, for screen readers ("this answer"). */
  subject?: string;
  align?: "start" | "center";
  className?: string;
  /** Called once the student has said their piece (a thumbs up, or a thumbs down and its note). */
  onRated?: (rating: 1 | -1) => void;
}

/**
 * Thumbs up or down, with an optional note after a thumbs down. Saved quietly: a failed
 * save never interrupts the student.
 */
const RateThis: FC<Props> = ({ kind, itemId, initial, question, subject = "this", align = "start", className, onRated }) => {
  const [rating, setRating] = useState<number>(initial ?? 0);
  const [touched, setTouched] = useState(false);
  const [asking, setAsking] = useState(false);
  const [note, setNote] = useState("");
  const [thanks, setThanks] = useState(false);
  const [rate] = useRateMutation();

  useEffect(() => {
    if (!touched && initial !== undefined) setRating(initial);
  }, [initial, touched]);

  useEffect(() => {
    if (!thanks) return;
    const t = setTimeout(() => setThanks(false), 2600);
    return () => clearTimeout(t);
  }, [thanks]);

  const choose = (value: 1 | -1) => {
    const next = rating === value ? 0 : value;
    setTouched(true);
    setRating(next);
    setAsking(next === -1);
    setThanks(next === 1);
    void rate({ kind, itemId, rating: next as 1 | -1 | 0 });
    if (next === 1) onRated?.(1);
  };

  const sendNote = (e: FormEvent) => {
    e.preventDefault();
    const comment = note.trim();
    setAsking(false);
    setThanks(true);
    if (comment) void rate({ kind, itemId, rating: -1, comment });
    onRated?.(-1);
  };

  const button = (value: 1 | -1) => {
    const on = rating === value;
    const Icon = value === 1 ? ThumbsUp : ThumbsDown;
    const label = value === 1 ? "Helpful" : "Not helpful";
    return (
      <button
        type="button"
        aria-pressed={on}
        aria-label={`${label}: rate ${subject}`}
        title={label}
        onClick={() => choose(value)}
        className={cn(
          "grid h-8 w-8 place-items-center rounded-lg transition-colors max-md:h-10 max-md:w-10",
          on ? "bg-hover text-ink" : "text-faint hover:bg-hover hover:text-ink"
        )}
      >
        <Icon size={15} strokeWidth={on ? 2.2 : 1.75} fill={on ? "currentColor" : "none"} fillOpacity={on ? 0.15 : 0} aria-hidden />
      </button>
    );
  };

  return (
    <div className={cn("flex flex-col gap-2", align === "center" && "items-center", className)}>
      <div role="group" aria-label={question ?? `Rate ${subject}`} className="flex items-center gap-0.5">
        {question && <span className="mr-2 text-[13px] font-medium text-subtle">{question}</span>}
        {button(1)}
        {button(-1)}
        <span aria-live="polite" className={cn("ml-1.5 text-[12.5px] text-subtle transition-opacity", thanks ? "opacity-100" : "opacity-0")}>
          {thanks ? "Thanks" : ""}
        </span>
      </div>
      {asking && (
        <form onSubmit={sendNote} className={cn("flex w-full max-w-[360px] items-center gap-1.5", align === "center" && "mx-auto")}>
          <label htmlFor={`note-${kind}-${itemId}`} className="sr-only">
            What went wrong?
          </label>
          <input
            id={`note-${kind}-${itemId}`}
            autoFocus
            value={note}
            maxLength={500}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What went wrong? (optional)"
            className="h-9 min-w-0 flex-1 rounded-lg border border-control bg-surface px-3 text-[16px] text-ink placeholder:text-faint focus:border-ink focus:outline-none md:text-[13px]"
          />
          <button type="submit" className="h-9 shrink-0 rounded-lg bg-ink px-3 text-[13px] font-semibold text-surface transition-opacity hover:opacity-90">
            {note.trim() ? "Send" : "Skip"}
          </button>
        </form>
      )}
    </div>
  );
};

export default RateThis;
