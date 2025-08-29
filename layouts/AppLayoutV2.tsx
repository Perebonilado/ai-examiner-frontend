import LanguageChangeBar from "@/@shared/components/AppLayout/LanguageChangeBar";
import Sidebar from "@/@shared/components/AppLayout/Sidebar";
import TopNav from "@/@shared/components/AppLayout/TopNav";
import MobileAppNav from "@/@shared/components/MobileAppNav";
import MobileSidebar from "@/@shared/components/MobileSidebar";
import UpgradeAccountForm from "@/@shared/components/UpgradeAccountForm";
import Button from "@/@shared/ui/Button";
import { useGetUserProfileQuery } from "@/api-services/user.service";
import { useModalContext } from "@/contexts/ModalContext";
import { useIsLoggedIn } from "@/hooks/useIsLoggedIn";
import ChevronLeft from "@/icons/ChevronLeft";
import React, { FC, PropsWithChildren, useState } from "react";
import cn from "classnames";

interface Props {
  handleBack?: () => void;
  noPadding?: boolean;
}

const AppLayoutV2: FC<PropsWithChildren<Props>> = ({
  children,
  handleBack,
  noPadding = false,
}) => {
  const [isSideNav, setIsSideNav] = useState(false);
  const { isLoggedIn } = useIsLoggedIn();
  const { data } = useGetUserProfileQuery("", { skip: !isLoggedIn });
  const { setModalContent } = useModalContext();

  return (
    <div className="min-h-[100dvh] flex flex-col">
      {/* Mobile Nav - stays at top */}
      <div className="sticky top-0 z-50 md:hidden">
        <MobileAppNav
          isSideNav={isSideNav}
          handleClick={() => setIsSideNav(!isSideNav)}
        />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar
        isSideNav={isSideNav}
        handleCloseSidebar={() => setIsSideNav(false)}
      />

      {/* Main content area */}
      <section className="flex flex-1 w-full max-h-screen overflow-hidden">
        {/* Desktop Sidebar + TopNav */}
        <div className="max-md:hidden">
          <TopNav />
          <Sidebar />
        </div>

        <main className="flex-1 w-full overflow-y-auto">
          {/* Desktop-only header actions */}
          <div className="max-md:hidden flex items-center justify-between border-b border-b-gray-300">
            {handleBack && (
              <Button
                title="Back"
                variant="text"
                starticon={<ChevronLeft />}
                className="!gap-1"
                size="small"
                onClick={handleBack}
              />
            )}
            <div className="flex items-center justify-end ml-auto gap-6">
              {data?.role.toLowerCase() === "guest" && (
                <div className="max-md:hidden">
                  <Button
                    title="Upgrade Account"
                    variant="outlined"
                    size="small"
                    className="!w-fit min-w-[150px]"
                    onClick={() => {
                      setModalContent(<UpgradeAccountForm />);
                    }}
                  />
                </div>
              )}
              <LanguageChangeBar />
            </div>
          </div>

          {/* Page content */}
          <div
            className={cn("", {
              ["p-4"]: !noPadding,
            })}
          >
            {children}
          </div>
        </main>
      </section>
    </div>
  );
};

export default AppLayoutV2;
