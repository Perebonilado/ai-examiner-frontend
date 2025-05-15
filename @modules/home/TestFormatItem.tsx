import BetaIcon from "@/icons/BetaIcon";
import React, { FC } from "react";
import cn from "classnames";

export interface TestFormatItem {
  title: string;
  description: string;
  value: number;
  icon: React.ReactNode;
  isBeta?: boolean;
  handleSelect?: (value: number) => void;
  selected?: boolean;
}

const TestFormatItem: FC<TestFormatItem> = ({
  icon,
  title,
  description,
  value,
  isBeta,
  handleSelect,
  selected,
}) => {
  const rootClassname = cn(
    `flex items-center gap-6 border border-[#CECECE] rounded-lg p-4 cursor-pointer hover:border-[#9E69E3]`,
    {
      ["bg-[#F7F4FF] !border-[#9E69E3]"]: selected,
    }
  );
  return (
    <div
      className={rootClassname}
      onClick={() => {
        handleSelect && handleSelect(value);
      }}
    >
      <div>{icon}</div>
      <div style={{ flex: 1 }} className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold mb-1">{title}</p>
          <p className="text-xs text-[#00000080]">{description}</p>
        </div>

        {isBeta && <BetaIcon />}
      </div>
    </div>
  );
};

export default TestFormatItem;
