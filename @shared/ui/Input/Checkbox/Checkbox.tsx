import CheckIcon from "@/icons/CheckIcon";
import React, { FC } from "react";
import cn from "classnames";
import s from "./styles.module.css";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  customBorderColor?: string;
  customLabelColor?: string;
  boldLabel?: boolean;
  shape?: "round" | "square" | "unrounded";
}

const Checkbox: FC<Props> = ({
  label,
  customBorderColor = "",
  customLabelColor = "black",
  shape = "square",
  boldLabel = false, 
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

  const pseudoContaineStyles = cn(
    `w-[25px] h-[25px] bg-white  border border-[#2F004F]`,
    {
      ["rounded-full"]: shape === "round",
      ["rounded-md"]: shape === "square",
      ["rounded-none"]: shape === "unrounded",
    }
  );
  return (
    <div className="flex items-center gap-2">
      <div className=" relative">
        <div
          className={pseudoContaineStyles}
          style={{ borderColor: customBorderColor }}
        ></div>
        <input {...props} type="checkbox" className={checkInputStyles} />
        <span className={checkIconStyles}>
          {shape === "square" && <CheckIcon />}
          {shape === "round" && (
            <div className="w-[10px] h-[10px] rounded-full bg-[#2F004F]"></div>
          )}
        </span>
      </div>
      <label className="text-black text-sm" style={{ color: customLabelColor, fontWeight: boldLabel ? 600 : 'unset' }}>
        {label}
      </label>
    </div>
  );
};

export default Checkbox;
