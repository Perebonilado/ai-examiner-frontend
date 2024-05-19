import React, { FC } from "react";
import { generateScoreColor } from "@/utils";
import cn from "classnames";

interface Props {
  score?: number;
}

const ScorePill: FC<Props> = ({ score }) => {
  const scoreColor = score ? `bg-${generateScoreColor(score).scoreColor}` : "bg-white";

  const rootClassName = cn(
    `shadow-lg px-6 py-1 rounded-xl ${scoreColor}`
  );

  return (
    <div className={rootClassName}>
      <p className="text-sm font-bold text-white">
        {score ? `Grade: ${score}%` : <span className="text-gray-500">Unattempted</span>}
      </p>
    </div>
  );
};

export default ScorePill;
