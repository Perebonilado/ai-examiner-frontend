import AppLogoAlt from "@/@shared/components/AppLogoAlt";
import Hamburger from "@/@shared/components/Hamburger";
import React, { FC } from "react";
import UserManagementBox from "./UserManagementBox";
import GoogleTranslateLanguagePicker from "./GoogleTranslateLanguagePicker";

interface Props {
  handleClick: () => void;
  isSideNav: boolean;
  isLoggedIn?: boolean;
}

const MobileAppNav: FC<Props> = ({
  handleClick,
  isSideNav,
  isLoggedIn = true,
}) => {
  return (
    <nav className="bg-[#2F004F] px-4 h-[50px] w-full fixed z-50 flex items-center md:hidden">
      <div className="px-0 flex justify-between items-center w-full">
        <div className="flex items-center gap-5">
          <Hamburger isSideNavOpen={isSideNav} onClick={handleClick} />
          <AppLogoAlt size="sm" />
        </div>
        {isLoggedIn && (
          <div className="flex items-center justify-end gap-3">
            <GoogleTranslateLanguagePicker />
            <UserManagementBox />
          </div>
        )}
        {!isLoggedIn && (
          <div className="flex items-center justify-end gap-6">
            <GoogleTranslateLanguagePicker />
          </div>
        )}
      </div>
    </nav>
  );
};

export default MobileAppNav;
