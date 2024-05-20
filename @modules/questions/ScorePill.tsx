import React, { FC } from "react";
import { generateScoreColor } from "@/utils";
import cn from "classnames";

interface Props {
  score: number | null;
}

const ScorePill: FC<Props> = ({ score }) => {
  const scoreColor = generateScoreColor(score).scoreColor

  const rootClassName = cn(
    `shadow-lg px-6 py-1 rounded-xl`,
  );

  return (
    <div className={rootClassName} style={{backgroundColor: scoreColor}}>
      <p className="text-sm font-bold text-white">
        {score !== null ? `Grade: ${score.toFixed(2)}%` : <span className="text-gray-500">Unattempted</span>}
      </p>
    </div>
  );
};

export default ScorePill;
