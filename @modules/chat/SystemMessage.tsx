import React, { FC, useEffect, useState, useRef } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { ChevronDown, ChevronUp } from "lucide-react";
import cn from "classnames";

interface Props {
  message: string;
  scrollToBottom?: () => void;
}

// Long replies fold to this height behind "Show more".
const COLLAPSED_HEIGHT = 236;

// The assistant's reply: plain text on the panel, no bubble.
const SystemMessage: FC<Props> = ({ message, scrollToBottom }) => {
  const [htmlMessage, setHtmlMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldShowToggle, setShouldShowToggle] = useState(false);
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (message) {
      handleHtmlMessage();
    }
  }, [message]);

  useEffect(() => {
    if (innerRef.current) {
      const height = innerRef.current.scrollHeight;
      const foldable = height > COLLAPSED_HEIGHT + 40;
      setShouldShowToggle(foldable);
      setContentHeight(foldable && !isExpanded ? COLLAPSED_HEIGHT : height);
    }
  }, [htmlMessage, isExpanded]);

  const handleHtmlMessage = async () => {
    const formatted = message;
    const parsed = await marked(DOMPurify.sanitize(formatted), {});
    setHtmlMessage(parsed);
  };

  const isFolded = shouldShowToggle && !isExpanded;

  return (
    <div className="w-full">
      <div
        className={cn(
          "overflow-hidden transition-[max-height] duration-500 ease-out-expo motion-reduce:transition-none",
          { "[mask-image:linear-gradient(#000_60%,transparent)]": isFolded }
        )}
        style={{ maxHeight: contentHeight ?? COLLAPSED_HEIGHT }}
      >
        <div
          ref={innerRef}
          className={cn(
            "prose prose-sm max-w-none break-words overflow-x-hidden text-sm leading-[1.65] text-body",
            "[--tw-prose-body:var(--body)] [--tw-prose-headings:var(--ink)] [--tw-prose-bold:var(--ink)]",
            "[--tw-prose-bullets:var(--faint)] [--tw-prose-counters:var(--faint)] [--tw-prose-links:var(--accent)]",
            "[--tw-prose-code:var(--ink)] [--tw-prose-quotes:var(--subtle)] [--tw-prose-quote-borders:var(--line)] [--tw-prose-hr:var(--line)]",
            "prose-p:my-0 prose-p:leading-[1.65] [&>*+*]:!mt-2.5 prose-ul:my-0 prose-ol:my-0 prose-ul:pl-[18px] prose-ol:pl-[18px]",
            "prose-li:my-0 [&_li]:!mb-0 [&_li+li]:!mt-1 prose-li:pl-0.5 [&_ul]:!ml-0 [&_ol]:!ml-0",
            "prose-strong:font-semibold prose-headings:mb-0 prose-headings:mt-0",
            "prose-headings:text-[15px] prose-headings:font-semibold"
          )}
          dangerouslySetInnerHTML={{ __html: htmlMessage }}
        />
      </div>

      {shouldShowToggle && (
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
    </div>
  );
};

export default SystemMessage;
