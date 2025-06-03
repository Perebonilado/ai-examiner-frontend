import React, { FC, useEffect, useState } from "react";
import { AppLogo } from "../AppLogo";
import Container from "@/@shared/ui/Container";
import { accessToken, navLinks } from "@/constants";
import Link from "next/link";
import Cookies from "js-cookie";
import GoogleTranslateLanguagePicker from "../GoogleTranslateLanguagePicker";
import UserManagementBox from "../UserManagementBox";

const NavbarV2: FC = () => {
  const [userIsLoggedIn, setUserIsLoggedIn] = useState(false);
  const handleRouteUserOnAuthenticated = () => {
    const token = Cookies.get(accessToken);

    if (token) {
      setUserIsLoggedIn(true);
    } else {
      setUserIsLoggedIn(false);
    }
  };
  useEffect(() => {
    handleRouteUserOnAuthenticated();
  }, []);
  return (
    <Container>
      <nav className="flex items-center py-3 gap-10">
        <div className="flex items-center gap-16" style={{ flex: 1 }}>
          <AppLogo />

          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-8 max-md:hidden">
            {navLinks.map((link, idx) => (
              <Link href={link.link} key={idx}>
                <span className="text-sm font-light">{link.title}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 max-md:gap-2">
          {!userIsLoggedIn && (
            <>
              <div className="max-md:hidden">
                <Link href={"/auth/login"}>
                  <button className="py-3 px-8 text-sm bg-white rounded-[50px] border border-[#2F004F] font-[600]">
                    Sign in
                  </button>
                </Link>
              </div>

              <div className="md:hidden">
                <Link href={"/auth/login"}>
                  <button className="text-sm font-light truncate block max-w-[50px] whitespace-nowrap overflow-hidden">
                    Sign in
                  </button>
                </Link>
              </div>
            </>
          )}

          {!userIsLoggedIn && <div className="h-[20px] w-[1px] bg-black md:hidden"></div>}

          {!userIsLoggedIn && (
            <>
              <div className="max-md:hidden">
                <Link href={"/auth/signup"}>
                  <button className="py-3 px-8  text-sm  text-white rounded-[50px] border border-[#2F004F] bg-[#2F004F] font-[600] ">
                    Create account
                  </button>
                </Link>
              </div>

              <div className="md:hidden">
                <Link href={"/auth/signup"}>
                  <button className="text-sm font-semibold truncate block max-w-[60px] whitespace-nowrap overflow-hidden">
                    Sign up
                  </button>
                </Link>
              </div>
            </>
          )}

          <div className="ml-2 flex items-center" style={{ flex: 1 }}>
            <GoogleTranslateLanguagePicker />
          </div>
          {userIsLoggedIn && <UserManagementBox />}
        </div>
      </nav>
    </Container>
  );
};

export default NavbarV2;
