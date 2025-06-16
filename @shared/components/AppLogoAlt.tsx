import Image from "next/image";
import Link from "next/link";
import React, { FC } from "react";
import cn from "classnames";
import { useIsLoggedIn } from "@/hooks/useIsLoggedIn";

interface Props {
  size?: "md" | "sm" | "xs";
}

const AppLogoAlt: FC<Props> = ({ size = "md" }) => {
  const rootClassName = cn(`relative`, {
    "h-16 w-48": size === "md",
    "h-11 w-48": size === "sm",
    "h-8 w-42": size === "xs",
  });
  const { isLoggedIn } = useIsLoggedIn();

  return (
    <Link href={isLoggedIn ? "/new-document" : "/"}>
      <div
        className={cn(`relative`, {
          "h-16 w-48": size === "md",
          "h-9 w-48": size === "sm",
          "h-8 w-42": size === "xs",
        })}
      >
        {" "}
        <Image
          layout="fill"
          objectFit="contain"
          objectPosition="0% 50%"
          style={{
            cursor: "pointer",
          }}
          src={"/shared/logo-alt.png"}
          alt="ai examiner logo"
        />
      </div>
    </Link>
  );
};

export default AppLogoAlt;
