import Image from "next/image";
import React, { FC } from "react";

const PatternsBg: FC = () => {
  return (
    <div className="h-[150px] relative">
      <Image
        layout="fill"
        objectFit="cover"
        objectPosition="50% 100%"
        src={"/shared/patterns-bg.png"}
        alt={"background image"}
      />
    </div>
  );
};

export default PatternsBg;
