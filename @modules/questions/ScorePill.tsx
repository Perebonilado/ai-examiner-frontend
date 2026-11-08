import React, { FC } from "react";
import cn from "classnames";

interface Props {
  score: number | null;
  uncompleted?: boolean;
}

/** Tinted score badge: green 80+, amber 50–79, red under 50; grey when not scored. */
const ScorePill: FC<Props> = ({ score, uncompleted = false }) => {
  const getCardText = () => {
    if (uncompleted) {
      return "Uncompleted";
    }

    if (score !== null) {
      return `Score ${score.toFixed(0)}%`;
    }

    return `Not started`;
  };

  const rootClassName = cn(
    "inline-flex items-center h-[22px] px-2 rounded-full text-[11.5px] font-semibold whitespace-nowrap tabular-nums",
    {
      ["bg-sunken text-subtle"]: uncompleted || score === null,
      ["bg-success-bg text-success-strong"]: !uncompleted && score !== null && score >= 80,
      ["bg-warning-bg text-warning"]:
        !uncompleted && score !== null && score >= 50 && score < 80,
      ["bg-danger-bg text-danger-strong"]: !uncompleted && score !== null && score < 50,
    }
  );

  return <span className={rootClassName}>{getCardText()}</span>;
};

export default ScorePill;
