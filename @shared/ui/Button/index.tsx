import React, { HTMLAttributes, forwardRef } from "react";
import s from "./styles.module.css";
import cn from "classnames";

interface Props extends HTMLAttributes<HTMLButtonElement> {
  variant?: "contained" | "outlined" | "text";
  size?: "large" | "medium" | "small";
  title: string;
}

const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = "contained", size = "medium", title, ...props }, ref) => {
    const rootClassName = cn(`${s.root}`, {
      [s.contained]: variant === "contained",
      [s.outlined]: variant === "outlined",
      [s.text]: variant === "text",
      [s.large]: size === "large",
      [s.medium]: size === "medium",
      [s.small]: size === "small",
    });

    return (
      <button ref={ref} {...props} className={rootClassName}>
        {title}
      </button>
    );
  }
);

export default Button;
