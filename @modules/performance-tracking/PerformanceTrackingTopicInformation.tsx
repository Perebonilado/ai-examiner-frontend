import React, { FC, useState } from "react";
import Button from "@/@shared/ui/Button";
import ChevronDown from "@/icons/ChevronDown";
import cn from "classnames";
import TopicInfoCard from "./TopicInfoCard";

export interface PerformanceTrackingDetail {
  title: string;
}

interface Props {
  data: {
    topicsPassed: string[];
    topicsFailed: string[];
  };
  onOpenText: string;
  onClosedText: string;
}

const PerformanceTrackingTopicInformation: FC<Props> = ({
  data,
  onClosedText,
  onOpenText,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const expClassName = cn(
    "transition-max-h w-full flex flex-col gap-3 max-w-[800px] duration-500 ease-in-out overflow-hidden",
    {
      ["max-h-0"]: !isExpanded,
      ["max-h-[1500px]"]: isExpanded,
    }
  );
  return (
    <>
      <div className="flex flex-col items-center gap-3">
        <div className="w-full max-w-[200px]">
          <Button
            title={!isExpanded ? onClosedText : onOpenText}
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
          <div className="w-full mx-auto flex items-center justify-center gap-8 max-md:flex-col-reverse">
            <TopicInfoCard
              title="Topics Passed"
              data={data.topicsPassed}
              status="pass"
            />
            <TopicInfoCard
              title="Topics Failed"
              data={data.topicsFailed}
              status="fail"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default PerformanceTrackingTopicInformation;
