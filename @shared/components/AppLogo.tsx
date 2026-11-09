import { useIsLoggedIn } from "@/hooks/useIsLoggedIn";
import Image from "next/image";
import Link from "next/link";
import React, { FC } from "react";
import AppMark from "./AppLayout/AppMark";

/**
 * The logo image on light pages; in dark mode the same mark drawn from the theme's colours (the
 * image's wordmark is dark and would disappear on a dark page).
 */
export const AppLogo: FC = () => {
  const { isLoggedIn } = useIsLoggedIn();
  return (
    <>
      <Link href={isLoggedIn ? "/new-document" : "/"} className="dark:hidden">
        <div className="relative h-14 w-40">
          <Image
            layout="fill"
            objectFit="contain"
            objectPosition="0% 50%"
            style={{
              cursor: "pointer",
            }}
            src={"/shared/logo.png"}
            alt="AI Examiner home"
          />
        </div>
      </Link>
      <AppMark className="hidden h-14 text-xl dark:inline-flex" />
    </>
  );
};
