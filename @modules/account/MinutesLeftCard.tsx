import React, { FC } from "react";
import { millisecondsToMinutesSeconds } from "@/utils";

interface Props {
  milliSecondsLeft?: number;
}

const MinutesLeftCard: FC<Props> = ({ milliSecondsLeft }) => {
  return (
    <div className="px-4 pb-4 pt-[18px] md:px-[22px] md:pb-5 md:pt-[22px]">
      <p className="text-[13px] font-semibold text-subtle">Your time remaining is</p>
      <p className="mt-1.5 text-4xl font-extrabold leading-none tracking-[-0.035em] text-ink tabular-nums md:text-[40px]">
        {milliSecondsLeft
          ? millisecondsToMinutesSeconds(milliSecondsLeft)
          : "--"}
        {milliSecondsLeft && milliSecondsLeft > 0 ? (
          <small className="ml-1 text-base font-semibold tracking-normal text-subtle">
            minutes
          </small>
        ) : null}
      </p>
    </div>
  );
};

export default MinutesLeftCard;
