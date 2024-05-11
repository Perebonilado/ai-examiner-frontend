import Sidebar from "@/@shared/components/Sidebar/Sidebar";
import FadeIn from "@/transitions/FadeIn";
import React, { FC, PropsWithChildren } from "react";

const AppLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-neutral-100">
      <Sidebar />
      <main className="h-screen w-[calc(100%-300px)] max-md:w-full overflow-auto pb-40 pt-[2rem] px-4">
        <FadeIn>{children}</FadeIn>
      </main>
    </div>
  );
};

export default AppLayout;
