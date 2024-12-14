import React, { FC } from "react";

export interface PerformanceByTopicPercent {
  percentage: number;
  title: string;
}

const PerformanceTrackingBarItem: FC<PerformanceByTopicPercent> = ({ percentage, title }) => {
  return (
    <div className="w-full flex items-center gap-2 max-sm:flex-col">
      <p style={{ flex: 1 }} className="text-xs font-bold max-sm:w-full">{title}</p>
      <div style={{ flex: 4 }} className="bg-[#F4F4F4] max-sm:w-full">
        <div
          style={{ width: `${percentage}%` }}
          className="flex items-center justify-center h-[30px] bg-[#9A67E2]"
        >
          {percentage >= 15 ? (
            <p className="font-medium text-white text-xs">{percentage}%</p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default PerformanceTrackingBarItem;
