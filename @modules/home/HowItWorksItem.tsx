import Image from "next/image";
import React, { FC } from "react";

export interface HowItWorksItemProps {
  title: string;
  description: string;
  index: string;
  image: string;
}

const HowItWorksItem: FC<HowItWorksItemProps> = ({
  description,
  image,
  index,
  title,
}) => {
  return (
    <div className="flex even:flex-row-reverse gap-10 max-lg:!flex-col max-lg:items-center">
      <div className="w-[45%] h-[400px] max-lg:h-fit max-lg:w-full gap-6 flex items-center">
        <div>
          <p className="text-xl font-bold w-[50px] h-[50px] border-[2px] border-[#9A67C2] rounded-full flex items-center justify-center">
            {index}
          </p>
        </div>
        <div>
          <h3 className="text-xl font-medium text-[#2F004F]">{title}</h3>
          <p>{description}</p>
        </div>
      </div>
      <div className="w-[55%] h-[500px] max-lg:w-full max-lg:h-[350px] bg-[#F9F1FF] rounded-xl flex items-center justify-center">
        <div className="relative h-[70%] w-[75%] max-lg:w-[90%] max-lg:h-[80%]">
          <Image
            layout="fill"
            objectFit="contain"
            objectPosition="50% 50%"
            src={image}
            alt={title}
          />
        </div>
      </div>
    </div>
  );
};

export default HowItWorksItem;
