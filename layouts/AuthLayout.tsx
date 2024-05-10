import React, { FC, PropsWithChildren } from "react";
import Image from "next/image";
import FadeIn from "@/transitions/FadeIn";

const AuthLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <main className="h-screen flex">
      <section className="relative h-full w-5/12 max-lg:hidden">
        <Image
          src={"/auth/auth-image4.jpg"}
          alt="Login to Ai Examiner"
          style={{ objectFit: "cover" }}
          layout="fill"
          priority
        />
        <p className="absolute bottom-5 text-white text-2xl w-full text-center">
          AI EXAMINER
        </p>
      </section>
      <section className="flex justify-center items-center w-7/12 p-2 max-lg:w-full">
        <div className="border-[#324fa5] border min-h-[600px] py-10 w-full rounded-lg max-w-[650px] p-1 max-sm:max-w-full">
          <FadeIn>{children}</FadeIn>
        </div>
      </section>
    </main>
  );
};

export default AuthLayout;
