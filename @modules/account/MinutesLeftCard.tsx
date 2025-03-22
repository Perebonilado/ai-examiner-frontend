import React, { FC } from "react";
import { millisecondsToMinutesSeconds } from "@/utils";
import BuyCreditsIcon from "@/icons/BuyCreditsIcon";

interface Props {
  milliSecondsLeft?: number;
}

const MinutesLeftCard: FC<Props> = ({ milliSecondsLeft }) => {
  return (
    <div className="rounded-lg min-h-[150px] border border-[#CECECE] p-5">
      <BuyCreditsIcon />

      <p className="text-xs text-[#00000080] mt-6">Your time remaining is</p>
      <p className="mt-1 font-bold text-sm">
        {milliSecondsLeft
          ? millisecondsToMinutesSeconds(milliSecondsLeft)
          : "--"}{" "}
        {milliSecondsLeft && "minutes"}
      </p>
    </div>
  );
};

export default MinutesLeftCard;
