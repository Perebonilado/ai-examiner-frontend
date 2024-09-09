import AppLogoAlt from "@/@shared/components/AppLogoAlt";
import Hamburger from "@/@shared/components/Hamburger";
import React, { FC } from "react";
import UserManagementBox from "./UserManagementBox";

interface Props {
  handleClick: () => void;
  isSideNav: boolean;
}

const MobileAppNav: FC<Props> = ({ handleClick, isSideNav }) => {
  return (
    <nav className="bg-[#2F004F] px-4 h-[80px] w-full fixed z-50 flex items-center md:hidden">
      <div className="px-0 flex justify-between items-center w-full">
        <div className="flex items-center gap-5">
          <Hamburger isSideNavOpen={isSideNav} onClick={handleClick} />
          <AppLogoAlt size="sm"/>
        </div>
        <div className="flex items-center justify-end">
          <UserManagementBox />
        </div>
      </div>
    </nav>
  );
};

export default MobileAppNav;
