import React, { FC } from "react";
import { generateScoreColor } from "@/utils";
import cn from "classnames";

interface Props {
  score: number | null;
  uncompleted?: boolean;
}

const ScorePill: FC<Props> = ({ score, uncompleted = false }) => {
  const scoreColor = generateScoreColor(score).scoreColor;

  const rootClassName = cn(`px-2 py-1 rounded-xl`);

  const getCardText = () => {
    if (uncompleted) {
      return "Uncompleted";
    }

    if (score !== null) {
      return `Score ${score.toFixed(0)}%`;
    }

    return `Not Started`;
  };

  return (
    <div
      className={rootClassName}
      style={{ backgroundColor: uncompleted ? "#939393" : scoreColor }}
    >
      <p className="text-xs text-white">
        {<span className="text-white">{getCardText()}</span>}
      </p>
    </div>
  );
};

export default ScorePill;
