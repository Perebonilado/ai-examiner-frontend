import React, { FC } from "react";
import cn from "classnames";

interface Props {
  name?: string;
  className?: string;
}

/** Flat initials avatar (no photo, no gradient). */
const UserInitials: FC<Props> = ({ name = "", className }) => {
  const initial = name.trim().charAt(0).toUpperCase() || "U";
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent-100 text-xs font-bold text-accent-900",
        className
      )}
    >
      {initial}
    </span>
  );
};

export default UserInitials;
