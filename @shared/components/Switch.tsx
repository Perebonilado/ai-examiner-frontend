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
    `absolute w-[20px] h-[20px] rounded-full cursor-pointer top-1/2 -translate-y-1/2 transition-all`,
    {
      ["bg-white"]: !isChecked,
      ["bg-[#2F004F] translate-x-full"]: isChecked,
      ["!bg-gray-200 !cursor-auto"]: disabled,
    }
  );

  const sliderContainerClass = cn(
    `w-[40px] h-[14px] cursor-pointer rounded-full relative transition-all`,
    {
      ["bg-[#B39BC4]"]: isChecked,
      ["bg-gray-400"]: !isChecked,
      ["!bg-gray-300"]: disabled,
    }
  );

  const labelStyling = cn(`text-xs font-semibold`, {
    ["text-[#858585]"]: disabled,
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
          style={{
            boxShadow:
              "#00000033 0px 2px 1px -1px, #00000024 0px 1px 1px 0px, #0000001F 0px 1px 3px 0px",
          }}
          className={sliderClass}
        ></div>
      </div>
    </div>
  );
};

export default Switch;
