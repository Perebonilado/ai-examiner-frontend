import SiteHeader from "@/@shared/components/site/SiteHeader";
import SiteFooter from "@/@shared/components/site/SiteFooter";
import React, { FC, PropsWithChildren } from "react";

interface Props {
  backgroundColor?: string;
}

/** Public pages (pricing, privacy policy, shared questions): the site header and footer from the
 *  home page around the page's own content. */
const WebLayout: FC<PropsWithChildren<Props>> = ({ children, backgroundColor = "white" }) => (
  <div className="bg-white">
    <SiteHeader />
    <main style={{ backgroundColor }}>{children}</main>
    <SiteFooter className="mt-16 lg:mt-24" />
  </div>
);

export default WebLayout;
