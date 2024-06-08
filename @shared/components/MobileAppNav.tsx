import AppLogoAlt from "@/@shared/components/AppLogoAlt";
import Hamburger from "@/@shared/components/Hamburger";
import React, { FC } from "react";

interface Props {
  handleClick: () => void;
  isSideNav: boolean;
}

const MobileAppNav: FC<Props> = ({handleClick, isSideNav}) => {
  return (
    <nav className="bg-[#2F004F] px-4 h-[80px] w-full fixed z-50 flex items-center md:hidden">
      <div className="px-0 flex justify-between items-center w-full">
        <AppLogoAlt />
        <Hamburger
          isSideNavOpen={isSideNav}
          onClick={handleClick}
        />
      </div>
    </nav>
  );
};

export default MobileAppNav;
