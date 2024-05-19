import Button from "@/@shared/ui/Button";
import Container from "@/@shared/ui/Container";
import React, { FC } from "react";
import { AppLogo } from "../AppLogo";
import Link from "next/link";

const Navbar: FC = () => {
  return (
    <nav className="py-8">
      <Container>
        <div className="flex items-center">
          <div style={{ flex: 1 }}>
            <AppLogo />
          </div>
          <div
            style={{ flex: 1 }}
            className="flex items-center justify-end gap-3 max-md:hidden"
          >
            <Link href={"/auth/login"}>
              <Button title="Sign in" variant="outlined" size="large" />
            </Link>
            <Link href={"/auth/signup"}>
              {" "}
              <Button title="Create account" size="large" />
            </Link>
          </div>
        </div>
      </Container>
    </nav>
  );
};

export default Navbar;
