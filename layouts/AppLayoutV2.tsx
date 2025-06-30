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
          <div className="max-md:hidden flex items-center justify-between border-b border-b-gray-300">
            {handleBack && (
              <Button
                title="Back"
                variant="text"
                starticon={<ChevronLeft />}
                className="!gap-1"
                size="small"
                onClick={() => {
                  handleBack();
                }}
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
          <div
            className={cn(`max-md:pt-[115px]`, {
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
