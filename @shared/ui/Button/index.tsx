import React, { ButtonHTMLAttributes, forwardRef } from "react";
import s from "./styles.module.css";
import cn from "classnames";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "contained" | "outlined" | "text";
  size?: "large" | "medium" | "small";
  title: string;
  fullWidth?: boolean;
  starticon?: React.ReactNode;
  endicon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, Props>(
  (
    {
      variant = "contained",
      size = "medium",
      title,
      starticon,
      endicon,
      ...props
    },
    ref
  ) => {
    const rootClassName = cn(`${s.root}`, {
      [s.contained]: variant === "contained",
      [s.outlined]: variant === "outlined",
      [s.disabled]: props.disabled === true,
      [s.text]: variant === "text",
      [s.large]: size === "large",
      [s.medium]: size === "medium",
      [s.small]: size === "small",
      ["w-full"]: props.fullWidth,
    }, `${props.className}`);

    return (
      <button ref={ref} {...props} className={rootClassName}>
        {starticon}
        {title}
        {endicon}
      </button>
    );
  }
);

export default Button;
