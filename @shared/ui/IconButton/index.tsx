import React, { ButtonHTMLAttributes, forwardRef } from "react";
import s from "./styles.module.css";
import cn from "classnames";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "contained" | "outlined";
  size?: "large" | "medium" | "small";
  title?: string;
  icon: React.ReactNode;
}

const IconButton = forwardRef<HTMLButtonElement, Props>(
  ({ variant = "contained", size = "medium", title, icon, ...props }, ref) => {
    const rootClassName = cn(
      `${s.root}`,
      {
        [s.contained]: variant === "contained",
        [s.outlined]: variant === "outlined",
        [s.disabled]: props.disabled === true,
        [s.large]: size === "large",
        [s.medium]: size === "medium",
        [s.small]: size === "small",
      },
      `${props.className}`
    );

    return (
      <button
        ref={ref}
        {...props}
        className="flex flex-col gap-1 items-center justify-center"
      >
        <div className={rootClassName}>{icon}</div>
       {title &&  <p className="text-xs">{title}</p>}
      </button>
    );
  }
);

export default IconButton;
