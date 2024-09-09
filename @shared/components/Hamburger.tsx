import React, { FC, HTMLAttributes, forwardRef } from "react";
import cn from "classnames";

interface Props extends HTMLAttributes<HTMLDivElement> {
  isSideNavOpen: boolean;
}

const Hamburger: FC<Props> = (props) => {
  const topHamStyling = cn("w-full h-[2px] bg-white transition-all", {
    "translate-y-[8px] rotate-45": props.isSideNavOpen,
  });
  const middleHamStyling = cn("w-full h-[2px] bg-white transition-all", {
    "-rotate-45": props.isSideNavOpen,
  });
  const bottomHamStyling = cn("w-full h-[2px] bg-white transition-all", {
    "-rotate-45 -translate-y-[8px]": props.isSideNavOpen,
  });
  return (
    <div
      className="w-[34px] h-[18px] flex-col justify-between cursor-pointer items-center hidden max-md:!flex"
      {...props}
    >
      <div className={topHamStyling}></div>
      <div className={middleHamStyling}></div>
      <div className={bottomHamStyling}></div>
    </div>
  );
};

export default Hamburger;
