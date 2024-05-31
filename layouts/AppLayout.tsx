import Sidebar from "@/@shared/components/Sidebar/Sidebar";
import FadeIn from "@/transitions/FadeIn";
import React, { FC, PropsWithChildren } from "react";

const AppLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-white border-blue-700 border-[4px]">
      <Sidebar />
      <main className="h-screen w-[calc(100%-300px)] max-md:w-full overflow-auto pb-40 pt-[1.2rem] px-10 max-md:px-4">
        <FadeIn>{children}</FadeIn>
      </main>
    </div>
  );
};

export default AppLayout;
