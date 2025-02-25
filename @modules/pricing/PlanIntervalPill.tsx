import { PlanInterval } from "@/dto/plan.dto";
import { capitalizeFirstLetterOfEachWord } from "@/utils";
import React, { FC } from "react";
import cn from "classnames";

interface Props {
  title: PlanInterval;
  isActive: boolean;
  handleClick: (title: PlanInterval) => void;
}

const PlanIntervalPill: FC<Props> = ({ isActive, title, handleClick }) => {
  const classNames = cn(
    `px-5 py-2 text-sm font-semibold rounded-full`,
    {
      ["bg-[#F1EA17]"]: isActive,
      ["text-[#939393] bg-transparent"]: !isActive,
    }
  );
  return (
    <button
      className={classNames}
      onClick={() => {
        handleClick(title);
      }}
    >
      {capitalizeFirstLetterOfEachWord(title)}
    </button>
  );
};

export default PlanIntervalPill;
