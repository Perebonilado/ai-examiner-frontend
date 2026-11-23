import React, { FC, useLayoutEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import cn from "classnames";
import { ChevronDown, ChevronUp, ImageIcon, ThumbsDown, ThumbsUp } from "lucide-react";
import { ConversationDetail, Translation } from "@/models/insights.model";
import { formatKey, formatTime, lagosDateKey } from "../format";

type Message = ConversationDetail["messages"][number];

/** Long answers fold to this height until opened. */
const FOLDED = 260;

const Answer: FC<{ text: string }> = ({ text }) => {
  const inner = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  useLayoutEffect(() => {
    const el = inner.current;
    if (!el) return;
    const measure = () => setHeight(el.scrollHeight);
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const foldable = height !== null && height > FOLDED + 60;
  const folded = foldable && !open;

  return (
    <div className="flex flex-col gap-1.5">
      <div
        className={cn("overflow-hidden", folded && "[mask-image:linear-gradient(#000_65%,transparent)]")}
        style={{ maxHeight: folded ? FOLDED : undefined }}
      >
        <div
          ref={inner}
          className={cn(
            "prose prose-sm max-w-none break-words text-[14px] leading-[1.65] text-body dark:prose-invert",
            "[--tw-prose-body:var(--body)] [--tw-prose-headings:var(--ink)] [--tw-prose-bold:var(--ink)] [--tw-prose-bullets:var(--faint)] [--tw-prose-counters:var(--faint)]",
            "prose-p:my-0 [&>*+*]:!mt-2.5 prose-ul:my-0 prose-ol:my-0 prose-li:my-0 [&_li+li]:!mt-1 prose-headings:mb-0 prose-headings:mt-0 prose-headings:text-[15px] prose-headings:font-semibold"
          )}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
        </div>
      </div>
      {foldable && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="-ml-2 inline-flex h-8 w-fit items-center gap-1 rounded-lg px-2 text-[13px] font-semibold text-subtle transition-colors hover:bg-hover hover:text-ink"
        >
          {open ? "Show less" : "Show the full answer"}
          {open ? <ChevronUp size={15} aria-hidden="true" /> : <ChevronDown size={15} aria-hidden="true" />}
        </button>
      )}
    </div>
  );
};

const Rating: FC<{ rating: NonNullable<Message["rating"]> }> = ({ rating }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-semibold",
      rating.value > 0 ? "bg-success-bg text-success-strong" : "bg-danger-bg text-danger-strong"
    )}
    title={rating.comment ?? undefined}
  >
    {rating.value > 0 ? <ThumbsUp size={11} aria-hidden="true" /> : <ThumbsDown size={11} aria-hidden="true" />}
    {rating.value > 0 ? "Student found this helpful" : "Student found this unhelpful"}
    {rating.comment && <span className="font-normal">: “{rating.comment}”</span>}
  </span>
);

/**
 * A conversation laid out the way the student had it: their questions on the right, the app's
 * answers as plain text on the left, a line for each new day, and long answers folded.
 */
export const Thread: FC<{
  messages: Message[];
  studentName: string;
  /** The English for a message, when the thread is showing English. */
  translated?: (id: string) => Translation | null;
}> = ({ messages, studentName, translated }) => {
  const first = studentName.split(" ")[0] || "Student";
  let lastDay = "";
  return (
    <ol className="flex flex-col gap-6">
      {messages.map((m) => {
        const dayKey = lagosDateKey(m.at);
        const newDay = dayKey !== lastDay;
        lastDay = dayKey;
        const student = m.from === "student";
        const english = translated?.(m.id) ?? null;
        const text = english?.text ?? m.text;
        return (
          <React.Fragment key={m.id}>
            {newDay && (
              <li aria-hidden="true" className="flex items-center gap-3 text-[12px] font-medium text-muted">
                <span className="h-px flex-1 bg-line" />
                {formatKey.weekdayDayMonth(dayKey)}
                <span className="h-px flex-1 bg-line" />
              </li>
            )}
            <li className={cn("flex flex-col gap-1.5", student ? "items-end pl-10 md:pl-16" : "items-start pr-2 md:pr-6")}>
              <span className="flex items-center gap-1.5 px-0.5 text-[12px] text-muted">
                <b className="font-semibold text-body">{student ? first : "AI Examiner"}</b>
                <span aria-hidden="true">·</span>
                <time dateTime={m.at}>{formatTime(m.at)}</time>
              </span>
              {student ? (
                <div className="max-w-full rounded-2xl rounded-tr-md bg-hover px-4 py-2.5 text-[14px] leading-relaxed text-ink">
                  <p className="whitespace-pre-wrap break-words">{text}</p>
                  {m.image && (
                    <a href={m.image} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-accent">
                      <ImageIcon size={13} aria-hidden="true" />
                      See the picture they sent
                    </a>
                  )}
                </div>
              ) : (
                <Answer key={english ? "en" : "original"} text={text} />
              )}
              {english && <p className="px-0.5 text-[11.5px] text-muted">Translated from {english.language}</p>}
              {m.cut && <p className="px-0.5 text-[12px] text-muted">Very long message, shortened here.</p>}
              {m.rating && <Rating rating={m.rating} />}
            </li>
          </React.Fragment>
        );
      })}
    </ol>
  );
};
