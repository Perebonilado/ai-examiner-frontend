import React, { FC } from "react";
import cn from "classnames";

interface Props {
  isChecked: boolean;
  handleCheck: () => void;
}

const CheckboxAlt: FC<Props> = ({ isChecked, handleCheck }) => {
  return (
    <button
      onClick={() => handleCheck()}
      className={cn(
        "w-[18px] h-[18px] flex-shrink-0 flex items-center justify-center rounded-[5px] border-[1.5px] border-[#c9c8d0] transition-colors duration-150",
        isChecked
          ? "bg-accent !border-accent"
          : "bg-surface hover:border-accent-300"
      )}
    >
      {isChecked && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-3 h-3 text-white"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="3"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      )}
    </button>
  );
};

export default CheckboxAlt;
