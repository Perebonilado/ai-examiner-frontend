import React, { FC } from "react";
import { ChevronLeft, Menu } from "lucide-react";
import AppMark from "./AppLayout/AppMark";
import LanguageChangeBar from "./AppLayout/LanguageChangeBar";
import UserManagementBox from "./UserManagementBox";

interface Props {
  handleClick: () => void;
  isSideNav: boolean;
  isLoggedIn?: boolean;
  /** When set, the bar shows a back button and the title instead of the menu and logo. */
  handleBack?: () => void;
  title?: string;
}

/** Phone top bar: white, 56px, hairline bottom. */
const MobileAppNav: FC<Props> = ({
  handleClick,
  isSideNav,
  isLoggedIn = true,
  handleBack,
  title,
}) => {
  const iconBtn =
    "grid h-10 w-10 shrink-0 place-items-center rounded-lg text-subtle transition-colors hover:bg-hover hover:text-ink";

  return (
    <nav className="sticky top-0 z-40 flex h-14 w-full items-center gap-2 border-b border-line bg-white/[0.92] pl-1.5 pr-2.5 backdrop-blur-[10px] md:hidden">
      {handleBack ? (
        <button type="button" aria-label="Back" onClick={handleBack} className={iconBtn}>
          <ChevronLeft size={20} strokeWidth={1.75} aria-hidden="true" />
        </button>
      ) : (
        <button
          type="button"
          aria-label={isSideNav ? "Close menu" : "Open menu"}
          aria-expanded={isSideNav}
          onClick={handleClick}
          className={iconBtn}
        >
          <Menu size={20} strokeWidth={1.75} aria-hidden="true" />
        </button>
      )}

      {title ? (
        <span className="min-w-0 truncate text-[15px] font-semibold text-ink">{title}</span>
      ) : (
        <AppMark className="!text-[15px]" />
      )}

      <div className="ml-auto flex shrink-0 items-center gap-1">
        <LanguageChangeBar compact />
        {isLoggedIn && !handleBack && <UserManagementBox />}
      </div>
    </nav>
  );
};

export default MobileAppNav;
