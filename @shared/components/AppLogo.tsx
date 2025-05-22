import Image from "next/image";
import Link from "next/link";
import React, { FC } from "react";

export const AppLogo: FC = () => {
  return (
    <Link href={"/"}>
      <div className="relative h-14 w-40">
        {" "}
        <Image
          layout="fill"
          objectFit="contain"
          objectPosition="0% 50%"
          style={{
            cursor: "pointer",
          }}
          src={"/shared/logo.png"}
          alt="ai examiner logo"
        />
      </div>
    </Link>
  );
};
