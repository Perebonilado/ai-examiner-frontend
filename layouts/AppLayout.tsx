import Sidebar from "@/@shared/components/Sidebar/Sidebar";
import FadeIn from "@/transitions/FadeIn";
import React, { FC, PropsWithChildren } from "react";

const AppLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-300 pt-[2rem]">
      <Sidebar />
      <main className="h-screen w-[calc(100%-300px)] max-md:w-full overflow-auto ">
        <FadeIn>{children}</FadeIn>
      </main>
    </div>
  );
};

export default AppLayout;
