import Button from "@/@shared/ui/Button";
import Container from "@/@shared/ui/Container";
import React, { FC, useEffect, useState } from "react";
import { AppLogo } from "../AppLogo";
import Link from "next/link";
import MobileNav from "../MobileNav";
import { accessToken, mobileScreenSizePx, navLinks } from "@/constants";
import Cookies from "js-cookie";
import UserManagementBox from "../UserManagementBox";
import NavLink from "../NavLink";
import MobileAppNav from "../MobileAppNav";
import MobileSidebar from "../MobileSidebar";
import GoogleTranslateLanguagePicker from "../GoogleTranslateLanguagePicker";

const Navbar: FC = () => {
  const [isMobileNav, setIsMobileNav] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [isSideNav, setIsSideNav] = useState(false);

  const handleCloseOnResize = () => {
    if (window.innerWidth <= mobileScreenSizePx) {
      setIsMobileNav(false);
    }
  };

  useEffect(() => {
    window.addEventListener("resize", handleCloseOnResize);

    return () => window.removeEventListener("resize", handleCloseOnResize);
  }, []);

  useEffect(() => {
    const loggedIn = Cookies.get(accessToken);

    if (loggedIn) {
      setIsUserLoggedIn(true);
    }
  }, []);

  return (
    <>
      <MobileSidebar
        isSideNav={isSideNav}
        handleCloseSidebar={() => {
          setIsSideNav(false);
        }}
      />
      <MobileAppNav
        isSideNav={isSideNav}
        isLoggedIn={isUserLoggedIn}
        handleClick={() => {
          setIsSideNav(!isSideNav);
        }}
      />
      <nav className="py-8 max-md:hidden">
        <Container>
          <div className="flex items-center gap-x-3 max-md:justify-between">
            <div style={{ flex: 1 }}>
              <AppLogo />
            </div>

            <div style={{ flex: 3 }} className="flex gap-8 items-center ml-8">
              {navLinks.map((item, idx) => {
                return <NavLink {...item} key={idx} />;
              })}
            </div>

            <div
              style={{ flex: 2 }}
              className="flex items-center justify-end gap-3 max-md:hidden"
            >
              {!isUserLoggedIn ? (
                <>
                  <div className="max-lg:hidden flex items-center gap-3">
                    <Link href={"/auth/login"}>
                      <Button title="Sign in" variant="outlined" size="large" />
                    </Link>
                    <Link href={"/auth/signup"}>
                      {" "}
                      <Button title="Create account" size="large" />
                    </Link>
                    <GoogleTranslateLanguagePicker />
                  </div>
                  <div className="lg:hidden">
                    <GoogleTranslateLanguagePicker />
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <GoogleTranslateLanguagePicker />
                  <UserManagementBox />
                </div>
              )}
            </div>
          </div>
        </Container>
      </nav>
    </>
  );
};

export default Navbar;
