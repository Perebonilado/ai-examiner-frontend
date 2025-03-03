import React, { FC } from "react";
import cn from "classnames";

interface Props {
  title: string;
  icon: React.ReactNode;
  isActive: boolean;
  activeColor: string;
  handleClick: () => void;
}

const CallActionButton: FC<Props> = ({
  activeColor,
  icon,
  isActive,
  title,
  handleClick,
}) => {
  return (
    <div className="flex flex-col gap-2 items-center justify-center">
      <p className="text-xs font-semibold">{title}</p>
      <button
        className="w-[45px] h-[45px] border border-gray-400 rounded-full flex items-center justify-center"
        onClick={handleClick}
        style={{
          borderColor: isActive ? activeColor : "#9ca3af",
        }}
      >
        {icon}
      </button>
    </div>
  );
};

export default CallActionButton;
