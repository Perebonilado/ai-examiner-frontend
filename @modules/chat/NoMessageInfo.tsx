import React, { FC } from "react";

interface Props {
  documentTitle: string;
  handleSelectSuggestion?: (suggestion: string) => void;
}

const suggestions = [
  "Summarize topics",
  "Simplify key concepts",
  "Answer specific questions about this topic",
];

// Empty chat: one centred greeting, quiet suggestion chips just above the composer.
const NoMessageInfo: FC<Props> = ({ documentTitle, handleSelectSuggestion }) => {
  return (
    <div className="flex-1 min-h-full flex flex-col">
      <div className="flex-1 grid place-items-center px-7 py-6 text-center">
        <h3 className="max-w-[22ch] text-[19px] font-semibold leading-[1.4] tracking-[-0.015em] text-ink [text-wrap:balance]">
          Let&apos;s explore {documentTitle} together
        </h3>
      </div>
      <div
        className="flex flex-wrap gap-1.5 px-3 pb-2"
        aria-label="Suggestions"
      >
        {suggestions.map((title) => (
          <button
            key={title}
            type="button"
            disabled={!handleSelectSuggestion}
            onClick={() => handleSelectSuggestion?.(title)}
            className="h-8 max-md:h-10 px-3 max-md:px-3.5 rounded-full border border-edge bg-surface text-[13px] font-medium text-subtle whitespace-nowrap transition-colors enabled:hover:bg-hover enabled:hover:text-ink disabled:cursor-default"
          >
            {title}
          </button>
        ))}
      </div>
    </div>
  );
};

export default NoMessageInfo;
