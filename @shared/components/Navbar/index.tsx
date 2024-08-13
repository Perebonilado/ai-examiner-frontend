import Button from "@/@shared/ui/Button";
import Container from "@/@shared/ui/Container";
import React, { FC, useEffect, useState } from "react";
import { AppLogo } from "../AppLogo";
import Link from "next/link";
import MobileNav from "../MobileNav";
import { accessToken, mobileScreenSizePx } from "@/constants";
import Cookies from "js-cookie";
import UserManagementBox from "../UserManagementBox";

const Navbar: FC = () => {
  const [isMobileNav, setIsMobileNav] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

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
    <nav className="py-8">
      <Container>
        <div className="flex items-center max-md:justify-between">
          <div style={{ flex: 1 }}>
            <AppLogo />
          </div>
          <div
            style={{ flex: 1 }}
            className="flex items-center justify-end gap-3 max-md:hidden"
          >
            {!isUserLoggedIn ? (
              <>
                <Link href={"/auth/login"}>
                  <Button title="Sign in" variant="outlined" size="large" />
                </Link>
                <Link href={"/auth/signup"}>
                  {" "}
                  <Button title="Create account" size="large" />
                </Link>
              </>
            ) : (
              <UserManagementBox />
            )}
          </div>
        </div>
      </Container>
      {
        <MobileNav
          isMobileNav={isMobileNav}
          handleClose={() => {
            setIsMobileNav(false);
          }}
        />
      }
    </nav>
  );
};

export default Navbar;
