import { mobileScreenSizePx } from "@/constants";
import Link from "next/link";
import { FC, useEffect } from "react";
import Button from "../ui/Button";
import cn from "classnames";
import Hamburger from "./Hamburger";
import CloseIcon from "@/icons/CloseIcon";

interface Props {
  handleClose: () => void;
  isMobileNav: boolean;
}

const MobileNav: FC<Props> = ({ handleClose, isMobileNav }) => {
  const rootStyles = cn(
    `bg-slate-300 overflow-x-hidden  transition-all w-[300px] max-w-[90vw] h-[100vh] z-[6000] fixed top-0  right-0  flex-col justify-between px-4`,
    {
      "translate-x-0": isMobileNav,
      "translate-x-full": !isMobileNav,
    }
  );

  return (
    <div className={rootStyles}>
      <div className="flex flex-col h-full pt-12">
        <div className="flex justify-end mb-8">
          <span className="cursor-pointer" onClick={handleClose}>
            <CloseIcon width={30} height={30} fill="black"/>
          </span>
        </div>
        <div style={{ flex: 4 }} className="flex flex-col gap-3">
          <Link href={"/auth/login"}>
            <Button title="Sign in" variant="outlined" size="large" fullWidth />
          </Link>
          <Link href={"/auth/signup"}>
            {" "}
            <Button title="Create account" size="large" fullWidth />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MobileNav;
