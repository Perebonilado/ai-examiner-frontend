import React, { FC } from "react";
import cn from "classnames";

interface Props {
  size?: "sm" | "md";
}

const Spinner: FC<Props> = ({ size = "md" }) => {
  const rootClass = cn(
    `border-8 border-solid border-gray-300 border-t-[#2F004F] rounded-full animate-spin`,
    {
      ["w-12 h-12"]: size === "md",
      ["w-8 h-8"]: size === "sm",
    }
  );
  return <div className={rootClass}></div>;
};

export default Spinner;
