import Sidebar from "@/@shared/components/Sidebar/Sidebar";
import FadeIn from "@/transitions/FadeIn";
import React, { FC, PropsWithChildren, useState } from "react";
import MobileAppNav from "../@shared/components/MobileAppNav";
import MobileSidebar from "@/@shared/components/MobileSidebar";

const AppLayout: FC<PropsWithChildren> = ({ children }) => {
  const [isSideNav, setIsSideNav] = useState(false);

  return (
    <>
      <div className="flex h-screen overflow-hidden bg-white relative">
        <MobileAppNav
          isSideNav={isSideNav}
          handleClick={() => {
            setIsSideNav(!isSideNav);
          }}
        />

        <MobileSidebar
          isSideNav={isSideNav}
          handleCloseSidebar={() => {
            setIsSideNav(false);
          }}
        />

        <Sidebar />
        <main className="h-full max-md:pt-[120px] w-[calc(100%-300px)] max-md:w-full overflow-auto pb-40 px-10 max-md:px-4">
          <FadeIn>{children}</FadeIn>
        </main>
      </div>
    </>
  );
};

export default AppLayout;
