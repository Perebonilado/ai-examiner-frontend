import React, { FC } from "react";
import cn from "classnames";
import PerformanceTrackingBarItem, {
  PerformanceByTopicPercent,
  WEEKLY_GRID,
} from "./PerformanceTrackingBarItem";

interface Props {
  data: PerformanceByTopicPercent[];
}

const PerformanceTrackingBarItemContainer: FC<Props> = ({ data }) => {
  if (!data.length) {
    return (
      <p className="px-6 py-10 text-center text-sm text-subtle">
        No performance data
      </p>
    );
  }

  return (
    <div
      role="list"
      aria-label="Score by topic"
      className="px-4 pb-2 pt-2 md:px-6 md:pt-3"
    >
      {data.map((item, idx) => {
        return (
          <div role="listitem" key={idx}>
            <PerformanceTrackingBarItem {...item} />
          </div>
        );
      })}

      {/* axis */}
      <div className={cn(WEEKLY_GRID, "h-[30px] max-md:hidden")} aria-hidden="true">
        <span className="relative col-start-2 tabular-nums">
          {[0, 25, 50, 75, 100].map((v) => (
            <span
              key={v}
              className={cn(
                "absolute top-[7px] text-xs text-muted",
                v === 0 ? "" : v === 100 ? "-translate-x-full" : "-translate-x-1/2"
              )}
              style={{ left: `${v}%` }}
            >
              {v}%
            </span>
          ))}
        </span>
      </div>
    </div>
  );
};

export default PerformanceTrackingBarItemContainer;
