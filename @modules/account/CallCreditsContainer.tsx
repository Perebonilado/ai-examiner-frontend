import React, { FC } from "react";
import GetMinutesInfoCard from "./GetMinutesInfoCard";
import MinutesLeftCard from "./MinutesLeftCard";
import { useGetCallCreditsQuery } from "@/api-services/call-credits.service";

const CallCreditsContainer: FC = () => {
  const { data: credits } = useGetCallCreditsQuery("");
  return (
    <div className="lg:flex">
      <div
        style={{ flex: 1 }}
        className="lg:min-h-[600px] lg:border-r max-lg:mb-10"
      >
        <div className="lg:pr-4">
          <GetMinutesInfoCard />
        </div>
      </div>
      <div style={{ flex: 1 }} className="min-h-[600px]">
        <div className="lg:pl-4 w-full lg:max-w-[500px]">
          <MinutesLeftCard milliSecondsLeft={credits?.remainingCreditsMs} />
        </div>
      </div>
    </div>
  );
};

export default CallCreditsContainer;
