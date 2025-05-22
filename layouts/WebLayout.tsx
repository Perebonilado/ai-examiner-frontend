import Footer from "@/@shared/components/Footer";
import Navbar from "@/@shared/components/Navbar";
import NavbarV2 from "@/@shared/components/Navbar/NavbarV2";
import React, { FC, PropsWithChildren } from "react";

interface Props {
  backgroundColor?: string;
}

const WebLayout: FC<PropsWithChildren<Props>> = ({
  children,
  backgroundColor="white",
}) => {
  return (
    <section>
      <NavbarV2 />
      <section className="max-md:pt-[150px]" style={{ backgroundColor }}>
        {children}
      </section>
      <Footer />
    </section>
  );
};

export default WebLayout;
