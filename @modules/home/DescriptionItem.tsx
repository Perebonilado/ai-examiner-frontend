import Image from "next/image";
import React, { FC } from "react";
import cn from "classnames";

interface Props {
  title: string;
  body: string;
  imageSrc: string;
  imageAlt: string;
  isEven?: boolean;
}

const DescriptionItem: FC<Props> = ({
  title,
  body,
  imageSrc,
  imageAlt,
  isEven = false,
}) => {
  const imageContainerStyling = cn(`w-full flex`, {
    ["even:justify-end"]: isEven,
    ["odd:justify-start"]: !isEven,
  });

  return (
    <div className="flex even:flex-row-reverse gap-6 items-center w-full max-w-[1250px] mx-auto max-md:!flex-col max-md:items-center">
      <div className="w-full md:max-w-[300px]" style={{ flex: 2 }}>
        <h3 className="text-[#360B58] font-bold text-4xl max-md:text-3xl leading-relaxed">
          {title}
        </h3>
        <p className="mt-3 text-base max-md:text-sm">{body}</p>
      </div>
      <div className={imageContainerStyling} style={{ flex: 4 }}>
        <div className="md:h-[550px] max-md:h-[400px] w-full max-w-[700px] relative">
          <Image
            layout="fill"
            objectFit="contain"
            objectPosition="50% 0"
            src={imageSrc}
            alt={imageAlt}
          />
        </div>
      </div>
    </div>
  );
};

export default DescriptionItem;
