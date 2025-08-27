import React, { FC } from "react";
import cn from "classnames";

interface Props {
  label: string;
  value: string;
  selected: boolean;
  handleSelect: (label: string) => void;
}

const DifficultyMenuItem: FC<Props> = ({
  handleSelect,
  selected,
  label,
  value,
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
        handleSelect(value);
      }}
    >
      <p className="text-sm  text-center w-full">{label}</p>
    </div>
  );
};

export default DifficultyMenuItem;
