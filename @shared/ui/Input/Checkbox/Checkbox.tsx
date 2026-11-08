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
    s["check-icon"],
    { [s.square]: shape === "square" }
  );

  const pseudoContaineStyles = cn(
    `w-[20px] h-[20px] bg-surface border-[1.5px] border-[#c9c8d0]`,
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
          {shape === "square" && <CheckIcon fill="#ffffff" />}
          {shape === "round" && (
            <div className="w-[10px] h-[10px] rounded-full bg-accent"></div>
          )}
        </span>
      </div>
      <label className="text-ink text-sm" style={{ color: customLabelColor, fontWeight: boldLabel ? 600 : 'unset' }}>
        {label}
      </label>
    </div>
  );
};

export default Checkbox;
