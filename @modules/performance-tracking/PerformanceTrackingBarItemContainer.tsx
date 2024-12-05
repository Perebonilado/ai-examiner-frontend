import React, { FC } from "react";
import PerformanceTrackingBarItem, {
  PerformanceByTopicPercent,
} from "./PerformanceTrackingBarItem";
import Container from "@/@shared/ui/Container";

interface Props {
  data: PerformanceByTopicPercent[];
}

const PerformanceTrackingBarItemContainer: FC<Props> = ({ data }) => {
  return (
    <Container>
      <div className="flex flex-col gap-6 w-full mx-auto max-w-[800px] p-4 pb-16 rounded-lg shadow-md">
        <p className="text-[#939393] mb-8 text-sm">Overview</p>
        {data.map((item, idx) => {
          return <PerformanceTrackingBarItem {...item} key={idx} />;
        })}
      </div>
    </Container>
  );
};

export default PerformanceTrackingBarItemContainer;
