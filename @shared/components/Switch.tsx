import React, { FC } from "react";
import cn from "classnames";

interface Props {
  isChecked: boolean;
  handleChecked: () => void;
  disabled: boolean;
  label?: string;
}

const Switch: FC<Props> = ({ disabled, handleChecked, isChecked, label }) => {
  const sliderClass = cn(
    `absolute left-[2px] w-[16px] h-[16px] rounded-full cursor-pointer top-1/2 -translate-y-1/2 bg-white transition-transform duration-200`,
    {
      ["translate-x-[16px]"]: isChecked,
      ["!cursor-auto"]: disabled,
    }
  );

  const sliderContainerClass = cn(
    `w-[36px] h-[20px] flex-shrink-0 cursor-pointer rounded-full relative transition-colors`,
    {
      ["bg-accent"]: isChecked,
      ["bg-[#d9d8df]"]: !isChecked,
      ["opacity-50"]: disabled,
    }
  );

  const labelStyling = cn(`text-sm font-semibold text-ink`, {
    ["text-faint"]: disabled,
  });

  return (
    <div className="flex items-center justify-between gap-2 w-full">
      <label className={labelStyling}>{label}</label>
      <div
        className={sliderContainerClass}
        onClick={() => {
          if (!disabled) handleChecked();
        }}
      >
        <div
          style={{ boxShadow: "0 1px 2px rgba(0,0,0,.2)" }}
          className={sliderClass}
        ></div>
      </div>
    </div>
  );
};

export default Switch;
