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
        "w-5 h-5 flex-shrink-0 flex items-center justify-center rounded border border-gray-300 transition-colors duration-200",
        isChecked
          ? "bg-[#9333EA] border-[#9333EA]"
          : "bg-white hover:border-[#9333EA]"
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
