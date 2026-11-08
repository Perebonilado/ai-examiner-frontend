import React, { FC, useLayoutEffect, useMemo, useRef, useState } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { ChevronDown, ChevronUp, CircleAlert, RotateCcw } from "lucide-react";
import cn from "classnames";
import { MessageStatus } from "@/features/documentChatSlice";
import MessageLoader from "./MessageLoader";
import { closeOpenMarkdown, linkPageCitations, readingLabel } from "./chatStreamUtils";

interface Props {
  message: string;
  status?: MessageStatus;
  phase?: "reading" | "thinking";
  pages?: number[];
  /** A reader is open, so page citations are buttons that turn to that page. */
  canJumpToPage?: boolean;
  onPageClick?: (page: number) => void;
  onRetry?: () => void;
}

// Long replies fold to this height behind "Show more".
const COLLAPSED_HEIGHT = 236;

/** Markdown to safe HTML: parse first, then sanitise what the parser produced. */
const toHtml = (markdown: string, canJumpToPage: boolean) => {
  if (!markdown) return "";
  const parsed = marked.parse(markdown, { async: false }) as string;
  return linkPageCitations(DOMPurify.sanitize(parsed), canJumpToPage);
};

const citeStyles = [
  "[&_.chat-cite]:inline-flex [&_.chat-cite]:items-center [&_.chat-cite]:h-[19px] [&_.chat-cite]:px-[6px] [&_.chat-cite]:mx-px",
  "[&_.chat-cite]:rounded-[5px] [&_.chat-cite]:bg-well [&_.chat-cite]:text-[11.5px] [&_.chat-cite]:font-semibold [&_.chat-cite]:leading-none",
  "[&_.chat-cite]:text-subtle [&_.chat-cite]:align-[1px] [&_.chat-cite]:whitespace-nowrap",
  "[&_button.chat-cite]:cursor-pointer [&_button.chat-cite]:transition-colors [&_button.chat-cite:hover]:bg-hover [&_button.chat-cite:hover]:text-ink",
  "[&_button.chat-cite:focus-visible]:outline [&_button.chat-cite:focus-visible]:outline-2 [&_button.chat-cite:focus-visible]:outline-accent",
];

// The assistant's reply: plain text on the panel, no bubble.
const SystemMessage: FC<Props> = ({
  message,
  status,
  phase,
  pages,
  canJumpToPage = false,
  onPageClick,
  onRetry,
}) => {
  const streaming = status === "streaming";
  // Replies written while the student watched stay open; long replies from history fold.
  const [isExpanded, setIsExpanded] = useState(status !== undefined);
  const [innerHeight, setInnerHeight] = useState<number | null>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const html = useMemo(
    () => toHtml(streaming ? closeOpenMarkdown(message) : message, canJumpToPage),
    [message, streaming, canJumpToPage]
  );

  // Follow the text's height (it grows while streaming and reflows when the panel resizes).
  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const measure = () => setInnerHeight(el.scrollHeight);
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const foldable =
    !streaming && innerHeight !== null && innerHeight > COLLAPSED_HEIGHT + 40;
  const isFolded = foldable && !isExpanded;
  const maxHeight = streaming
    ? undefined
    : isFolded
    ? COLLAPSED_HEIGHT
    : innerHeight ?? COLLAPSED_HEIGHT;

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const cite = (event.target as HTMLElement).closest<HTMLElement>("[data-page]");
    const page = Number(cite?.dataset.page);
    if (page > 0) onPageClick?.(page);
  };

  const waiting = streaming && !message;

  return (
    <div className="w-full" aria-busy={streaming || undefined}>
      {waiting && (
        <div className="flex items-center gap-2.5 py-0.5 text-[13px] text-subtle">
          <MessageLoader />
          <span>{phase === "thinking" ? "Thinking" : readingLabel(pages)}…</span>
        </div>
      )}

      <div
        className={cn("overflow-hidden", {
          "transition-[max-height] duration-500 ease-out-expo motion-reduce:transition-none":
            !streaming,
          "[mask-image:linear-gradient(#000_60%,transparent)]": isFolded,
          hidden: waiting,
        })}
        style={{ maxHeight }}
      >
        <div
          ref={innerRef}
          onClick={handleClick}
          className={cn(
            "prose prose-sm max-w-none break-words overflow-x-hidden text-sm leading-[1.65] text-body",
            "[--tw-prose-body:var(--body)] [--tw-prose-headings:var(--ink)] [--tw-prose-bold:var(--ink)]",
            "[--tw-prose-bullets:var(--faint)] [--tw-prose-counters:var(--faint)] [--tw-prose-links:var(--accent)]",
            "[--tw-prose-code:var(--ink)] [--tw-prose-quotes:var(--subtle)] [--tw-prose-quote-borders:var(--line)] [--tw-prose-hr:var(--line)]",
            "prose-p:my-0 prose-p:leading-[1.65] [&>*+*]:!mt-2.5 prose-ul:my-0 prose-ol:my-0 prose-ul:pl-[18px] prose-ol:pl-[18px]",
            "prose-li:my-0 [&_li]:!mb-0 [&_li+li]:!mt-1 prose-li:pl-0.5 [&_ul]:!ml-0 [&_ol]:!ml-0",
            "prose-strong:font-semibold prose-headings:mb-0 prose-headings:mt-0",
            "prose-headings:text-[15px] prose-headings:font-semibold",
            ...citeStyles
          )}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>

      {foldable && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          className="inline-flex items-center gap-1 h-[30px] px-2 -ml-2 mt-0.5 rounded-[7px] text-[13px] font-semibold text-subtle hover:bg-hover hover:text-ink transition-colors"
        >
          {isExpanded ? "Show less" : "Show more"}
          {isExpanded ? (
            <ChevronUp size={15} strokeWidth={1.75} aria-hidden />
          ) : (
            <ChevronDown size={15} strokeWidth={1.75} aria-hidden />
          )}
        </button>
      )}

      {status === "stopped" && (
        <p className="mt-1.5 text-[12.5px] text-faint">Stopped</p>
      )}
      {status === "truncated" && (
        <p className="mt-1.5 text-[12.5px] text-faint">
          This reply was cut short. Ask me to continue.
        </p>
      )}
      {status === "error" && onRetry && (
        <div
          role="alert"
          className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[13px] text-danger"
        >
          <CircleAlert size={15} strokeWidth={1.75} aria-hidden />
          <span>The reply was interrupted</span>
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-[5px] h-[30px] max-md:h-10 px-2 rounded-[7px] text-[13px] font-semibold text-ink hover:bg-hover transition-colors"
          >
            <RotateCcw size={14} strokeWidth={1.75} aria-hidden />
            Retry
          </button>
        </div>
      )}
    </div>
  );
};

export default SystemMessage;
