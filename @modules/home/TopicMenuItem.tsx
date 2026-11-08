import React, { FC } from "react";
import cn from "classnames";
import { TopicsV2Model } from "@/models/file-upload.model";

interface Props {
  topic: TopicsV2Model;
  selected: boolean;
  handleSelect: (topic: TopicsV2Model) => void;
}

/* One calm row: title left, page range right. Selected = violet border + tint; no checkbox. */
const TopicMenuItem: FC<Props> = ({ handleSelect, selected, topic }) => {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      className={cn(
        "flex shrink-0 items-baseline gap-4 w-full min-h-[44px] max-md:min-h-[48px] px-3 py-3 max-md:py-[13px] rounded-[10px] border-[1.5px] text-left transition-colors",
        selected
          ? "border-accent bg-accent-50"
          : "border-transparent hover:bg-hover"
      )}
      onClick={() => {
        handleSelect(topic);
      }}
    >
      <span className="flex-1 min-w-0 text-sm font-medium leading-[1.45] text-ink first-letter:uppercase">
        {topic.title}
      </span>
      {topic.startPage && topic.endPage ? (
        <span className="flex-shrink-0 text-[13px] text-muted whitespace-nowrap tabular-nums">
          {topic.startPage == topic.endPage
            ? `Page ${topic.startPage}`
            : `Pages ${topic.startPage} - ${topic.endPage}`}
        </span>
      ) : null}
    </button>
  );
};

export default TopicMenuItem;
