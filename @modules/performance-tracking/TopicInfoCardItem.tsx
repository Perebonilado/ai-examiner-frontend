import React, { FC } from "react";
import { Check } from "lucide-react";
import cn from "classnames";

/* One row of the score-by-topic chart: checkbox, topic, horizontal bar, "c out of t".
   Desktop: a four-column grid whose plot cells carry the gridlines (0 / 25 / 50 / 75 / 100%).
   Phone: topic and score on one line, the bar on a sunken track underneath. */

// Shared column layout for rows, group labels and the axis
export const CHART_GRID =
  "grid grid-cols-[18px_minmax(0,1fr)_auto] gap-x-3 px-3 md:grid-cols-[18px_minmax(0,300px)_minmax(0,1fr)_84px] md:gap-x-4";

// Baseline at 0, hairlines every 25% and at 100%: continuous from row to row
export const PLOT_GRID_BG = [
  "linear-gradient(to right, var(--control) 1px, transparent 1px) 0 0 / 100% 100% no-repeat",
  "linear-gradient(to left, var(--line) 1px, transparent 1px) 0 0 / 100% 100% no-repeat",
  "linear-gradient(to right, var(--line) 1px, transparent 1px) 0 0 / 25% 100% repeat-x",
].join(", ");

interface Props {
  topicTitle: string;
  correctQuestionsCount: number;
  totalQuestionsCount: number;
  toggleTopicSelection: (topic: string) => void;
  isSelected: boolean;
}

const TopicInfoCardItem: FC<Props> = ({
  correctQuestionsCount,
  topicTitle,
  totalQuestionsCount,
  toggleTopicSelection,
  isSelected,
}) => {
  const share = totalQuestionsCount
    ? correctQuestionsCount / totalQuestionsCount
    : 0;
  const isWeak = correctQuestionsCount !== totalQuestionsCount;

  return (
    <label
      title={`${correctQuestionsCount} out of ${totalQuestionsCount} correct (${Math.round(
        share * 100
      )}%)`}
      className={cn(
        CHART_GRID,
        "cursor-pointer items-center rounded-lg hover:bg-well",
        "gap-y-[7px] pb-[11px] pt-[9px] md:min-h-10 md:gap-y-0 md:py-0"
      )}
    >
      <span className="col-start-1 row-span-2 row-start-1 grid place-items-center self-start pt-px md:row-span-1 md:self-center md:pt-0">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={isSelected}
          onChange={() => toggleTopicSelection(topicTitle)}
        />
        <span
          className={cn(
            "grid h-[18px] w-[18px] place-items-center rounded-[5px] border-[1.5px] transition-colors",
            "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-bright",
            isSelected
              ? "border-accent bg-accent text-white"
              : "border-[#c9c8d0] bg-surface"
          )}
        >
          {isSelected && <Check size={12} strokeWidth={3} aria-hidden="true" />}
        </span>
      </span>

      <span className="col-start-2 row-start-1 text-sm font-medium leading-[1.4] text-ink md:py-[9px]">
        {topicTitle}
        {isWeak && <span className="sr-only">, needs work</span>}
      </span>

      <span
        aria-hidden="true"
        className="relative col-span-2 col-start-2 row-start-2 flex h-2 items-center self-stretch overflow-hidden rounded bg-sunken md:col-span-1 md:col-start-3 md:row-start-1 md:h-auto md:overflow-visible md:rounded-none md:bg-transparent"
      >
        <span
          className="absolute inset-0 max-md:hidden"
          style={{ background: PLOT_GRID_BG }}
        />
        <span
          className={cn(
            "relative h-2 rounded-r-[4px] md:h-3",
            isWeak ? "bg-[#e2665b]" : "bg-accent-300"
          )}
          style={{ width: `${(share * 100).toFixed(2)}%` }}
        />
      </span>

      <span
        className={cn(
          "col-start-3 row-start-1 self-start whitespace-nowrap pt-px text-right text-[13px] tabular-nums md:col-start-4 md:self-center md:pt-0",
          isWeak ? "font-semibold text-ink" : "text-subtle"
        )}
      >
        {correctQuestionsCount} out of {totalQuestionsCount}
      </span>
    </label>
  );
};

export default TopicInfoCardItem;
