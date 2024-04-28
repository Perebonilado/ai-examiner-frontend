import CheckIcon from "@/icons/CheckIcon";
import React, { FC } from "react";
import cn from "classnames";
import s from "./styles.module.css";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  customBorderColor?: string;
  customLabelColor?: string;
}

const Checkbox: FC<Props> = ({
  label,
  customBorderColor = "",
  customLabelColor = "black",
  ...props
}) => {
  const checkInputStyles = cn(
    `w-[30px] h-[30px] absolute top-0 opacity-0 z-[40] !cursor-pointer`,
    s["check-input"]
  );
  const checkIconStyles = cn(
    `absolute top-1/2 -translate-y-1/2 left-1/2 z-[30] -translate-x-1/2`,
    s["check-icon"]
  );
  return (
    <div className="flex items-center gap-2">
      <div className=" relative">
        <div
          className="w-[25px] h-[25px] bg-white rounded-md border border-blue-400"
          style={{ borderColor: customBorderColor }}
        ></div>
        <input {...props} type="checkbox" className={checkInputStyles} />
        <span className={checkIconStyles}>
          <CheckIcon />
        </span>
      </div>
      <label className="text-black text-sm" style={{ color: customLabelColor }}>
        {label}
      </label>
    </div>
  );
};

export default Checkbox;
