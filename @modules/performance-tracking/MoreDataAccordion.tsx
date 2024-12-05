import React, { FC, useState } from "react";
import Button from "@/@shared/ui/Button";
import ChevronDown from "@/icons/ChevronDown";
import cn from "classnames";

export interface PerformanceTrackingDetail {
  title: string;
  comment: string;
  score: number;
}

interface Props {
  data: PerformanceTrackingDetail[];
}

const MoreDataAccordion: FC<Props> = ({ data }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const expClassName = cn(
    "transition-max-h w-full flex flex-col gap-8 max-w-[800px] duration-500 ease-in-out overflow-hidden",
    {
      ["max-h-0"]: !isExpanded,
      ["max-h-[1500px]"]: isExpanded,
    }
  );
  return (
    <>
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="w-full max-w-[200px]">
          <Button
            title={!isExpanded ? "Show more topic data" : "Hide topic details"}
            variant="text"
            fullWidth
            className="!bg-transparent"
            endicon={
              !isExpanded ? (
                <ChevronDown />
              ) : (
                <span className="rotate-180">
                  <ChevronDown />
                </span>
              )
            }
            onClick={() => setIsExpanded(!isExpanded)}
          />
        </div>
        <div className={expClassName}>
          {data.map((d, idx) => {
            return (
              <div key={idx} className="flex w-full flex-col gap-2">
                <h4 className="text-sm font-semibold">
                  {d.title} {d.score}%
                </h4>
                <p className="text-xs">{d.comment}</p>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default MoreDataAccordion;
