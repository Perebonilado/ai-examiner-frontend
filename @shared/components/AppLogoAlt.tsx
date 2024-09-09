import Image from "next/image";
import Link from "next/link";
import React, { FC } from "react";
import cn from "classnames";

interface Props {
  size?: "md" | "sm";
}

const AppLogoAlt: FC<Props> = ({ size = "md" }) => {
  const rootClassName = cn(`relative`, {
    "h-16 w-48": size === "md",
    "h-11 w-48": size === "sm",
  });

  return (
    <Link href={"/"}>
      <div className={rootClassName}>
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
