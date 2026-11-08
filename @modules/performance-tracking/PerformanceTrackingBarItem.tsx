import React, { FC } from "react";
import cn from "classnames";
import { PLOT_GRID_BG } from "./TopicInfoCardItem";

export interface PerformanceByTopicPercent {
  percentage: number;
  title: string;
}

// Topic, violet bar, percentage. Desktop: one line on a 25% grid; phone: bar on a track below.
export const WEEKLY_GRID =
  "grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 md:grid-cols-[minmax(0,260px)_minmax(0,1fr)_56px] md:gap-x-4";

const PerformanceTrackingBarItem: FC<PerformanceByTopicPercent> = ({
  percentage,
  title,
}) => {
  const value = Math.max(0, Math.min(100, Number(percentage) || 0));

  return (
    <div
      className={cn(
        WEEKLY_GRID,
        "items-center gap-y-[7px] py-2.5 md:min-h-10 md:gap-y-0 md:py-0"
      )}
    >
      <p className="col-start-1 row-start-1 text-sm font-medium leading-[1.4] text-ink md:py-[9px]">
        {title}
      </p>

      <span
        aria-hidden="true"
        className="relative col-span-2 col-start-1 row-start-2 flex h-2 items-center self-stretch overflow-hidden rounded bg-sunken md:col-span-1 md:col-start-2 md:row-start-1 md:h-auto md:overflow-visible md:rounded-none md:bg-transparent"
      >
        <span
          className="absolute inset-0 max-md:hidden"
          style={{ background: PLOT_GRID_BG }}
        />
        <span
          className="relative h-2 rounded-r-[4px] bg-accent-300 md:h-3"
          style={{ width: `${value}%` }}
        />
      </span>

      <p className="col-start-2 row-start-1 whitespace-nowrap text-right text-[13px] text-subtle tabular-nums md:col-start-3">
        {Math.round(value)}%
      </p>
    </div>
  );
};

export default PerformanceTrackingBarItem;
