import LanguageChangeBar from "@/@shared/components/AppLayout/LanguageChangeBar";
import Sidebar from "@/@shared/components/AppLayout/Sidebar";
import TopNav from "@/@shared/components/AppLayout/TopNav";
import MobileAppNav from "@/@shared/components/MobileAppNav";
import MobileSidebar from "@/@shared/components/MobileSidebar";
import React, { FC, PropsWithChildren, useState } from "react";

const AppLayoutV2: FC<PropsWithChildren> = ({ children }) => {
  const [isSideNav, setIsSideNav] = useState(false);

  return (
    <div className="h-screen overflow-hidden">
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
      <section className="flex h-screen">
        <div className="max-md:hidden">
          <TopNav />
          <Sidebar />
        </div>
        <main className="flex-1 overflow-y-auto">
          <div className="max-md:hidden">
            <LanguageChangeBar />
          </div>
          <div className="p-4 max-md:pt-[110px]">{children}</div>
        </main>
      </section>
    </div>
  );
};

export default AppLayoutV2;
