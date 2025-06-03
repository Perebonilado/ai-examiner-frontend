import React, { FC, HTMLAttributes, forwardRef } from "react";
import cn from "classnames";
import { useSelector } from "react-redux";
import { RootState } from "@/config/redux-config";

interface Props extends HTMLAttributes<HTMLDivElement> {
  isSideNavOpen: boolean;
}

const Hamburger: FC<Props> = (props) => {
  const { navOpen: isOpen } = useSelector(
    (state: RootState) => state.navigationSliceReducer
  );

  const topHamStyling = cn("w-full h-[1.5px] bg-white transition-all", {
    ["bg-white"]: isOpen,
  });
  const middleHamStyling = cn("w-full h-[1.5px] bg-white transition-all", {
   [ "bg-white"]: isOpen,
  });
  const bottomHamStyling = cn("w-full h-[1.5px] bg-white transition-all", {
   [ "bg-white"]: isOpen,
  });
  return (
    <div
      className="w-[25px] h-[13px] flex-col justify-between cursor-pointer items-center flex"
      {...props}
    >
      <div className={topHamStyling}></div>
      <div className={middleHamStyling}></div>
      <div className={bottomHamStyling}></div>
    </div>
  );
};

export default Hamburger;
