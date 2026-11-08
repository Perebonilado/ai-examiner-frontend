import React, { FC } from "react";
import cn from "classnames";

interface Props {
  title: string;
  icon: React.ReactNode;
  tone: "start" | "end";
  handleClick: () => void;
  disabled?: boolean;
}

/* The one call button: aubergine "Start call" before the call, red "End call" during it. */
const CallActionButton: FC<Props> = ({
  title,
  icon,
  tone,
  handleClick,
  disabled,
}) => {
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className="group flex flex-col items-center gap-2 text-[13px] font-semibold text-body focus-visible:outline-none disabled:cursor-default disabled:text-muted"
    >
      <span
        className={cn(
          "grid h-16 w-16 place-items-center rounded-full text-white shadow-lift transition-[background-color,transform] duration-150 group-active:scale-[0.97] group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-[3px] group-focus-visible:outline-accent-bright group-disabled:bg-sunken group-disabled:text-faint group-disabled:shadow-none",
          {
            "bg-brand group-hover:bg-brand-hover": tone === "start",
            "bg-danger group-hover:bg-danger-strong": tone === "end",
          }
        )}
      >
        {icon}
      </span>
      {title}
    </button>
  );
};

export default CallActionButton;
