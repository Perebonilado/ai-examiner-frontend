import React, { FC } from "react";
import cn from "classnames";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/config/redux-config";
import Hamburger from "../Hamburger";
import { toggleNavigation } from "@/features/navigationSlice";
import AppLogoAlt from "../AppLogoAlt";

const TopNav: FC = () => {
  const { navOpen: isOpen } = useSelector(
    (state: RootState) => state.navigationSliceReducer
  );

  const dispatch = useDispatch();

  return (
    <nav
      className={cn(
        `transition-all bg-[#2F004F] ease-in-out duration-300 h-[50px] pt-6 flex items-center px-4`,
        {
          ["w-[212px]"]: isOpen,
          ["w-[63px]"]: !isOpen,
        }
      )}
    >
      <div>
        <Hamburger
          isSideNavOpen={isOpen}
          onClick={() => {
            dispatch(toggleNavigation(!isOpen));
          }}
        />
      </div>
      <div
        className={cn("ml-3 origin-left transition-all duration-300 text-sm flex-1", {
          "opacity-100 scale-x-100": isOpen,
          "opacity-0 scale-x-0": !isOpen,
        })}
        style={{ transitionProperty: "opacity, transform" }}
      >
        <AppLogoAlt size="xs" />
      </div>
    </nav>
  );
};

export default TopNav;
