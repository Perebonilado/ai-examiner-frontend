import Footer from "@/@shared/components/Footer";
import NavbarV2 from "@/@shared/components/Navbar/NavbarV2";
import React, { FC, PropsWithChildren } from "react";
import cn from "classnames";

interface Props {
  backgroundColor?: string;
  paddingTopMd?: boolean;
}

const WebLayout: FC<PropsWithChildren<Props>> = ({
  children,
  backgroundColor = "white",
  paddingTopMd = true,
}) => {
  const className = cn({
    ["max-md:pt-[150px]"]: paddingTopMd,
  });
  return (
    <section>
      <NavbarV2 />
      <section className={className} style={{ backgroundColor }}>
        {children}
      </section>
      <Footer />
    </section>
  );
};

export default WebLayout;
