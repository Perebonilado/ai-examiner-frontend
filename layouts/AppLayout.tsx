import Sidebar from "@/@shared/components/Sidebar/Sidebar";
import FadeIn from "@/transitions/FadeIn";
import React, { FC, PropsWithChildren, useState } from "react";
import MobileAppNav from "../@shared/components/MobileAppNav";
import MobileSidebar from "@/@shared/components/MobileSidebar";
import UserManagementBox from "@/@shared/components/UserManagementBox";
import { useGetUserProfileQuery } from "@/api-services/user.service";
import { capitalizeFirstLetterOfEachWord } from "@/utils";
import PreferredLanguageButton from "@/@shared/components/PreferredLanguageButton";
import GoogleTranslateLanguagePicker from "@/@shared/components/GoogleTranslateLanguagePicker";

interface Props {
  showWelcomeMessage?: boolean;
}

const AppLayout: FC<PropsWithChildren<Props>> = ({
  children,
  showWelcomeMessage = false,
}) => {
  const [isSideNav, setIsSideNav] = useState(false);

  const { data } = useGetUserProfileQuery("", { skip: !showWelcomeMessage });

  return (
    <>
      <div className="flex md:h-screen md:max-h-screen md:overflow-hidden bg-white relative">
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
        <main className="h-full max-md:pt-[110px] w-[calc(100%-300px)] max-md:w-full overflow-auto pb-40 px-10 pt-4 max-md:px-4">
          <FadeIn>
            <>
              <div className="flex justify-between items-center pb-4">
                {data && data.firstName && showWelcomeMessage ? (
                  <p className="text-xl font-bold">
                    <span className="text-[#939393]">Welcome, </span>
                    {capitalizeFirstLetterOfEachWord(
                      data.firstName.toLowerCase()
                    )}
                  </p>
                ) : (
                  <div></div>
                )}

                <div className="max-md:hidden flex items-center gap-6">
                <GoogleTranslateLanguagePicker />
                  <UserManagementBox />
                </div>
              </div>
              {children}
            </>
          </FadeIn>
        </main>
      </div>
    </>
  );
};

export default AppLayout;
