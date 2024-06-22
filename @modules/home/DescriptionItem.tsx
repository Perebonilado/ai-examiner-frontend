import Image from "next/image";
import React, { FC } from "react";
import cn from "classnames";

interface Props {
  title: string;
  body: string;
  videoSrc: string;
  isEven?: boolean;
}

const DescriptionItem: FC<Props> = ({ title, body, isEven = false, videoSrc }) => {
  const imageContainerStyling = cn(`w-full flex`, {
    ["even:justify-end"]: isEven,
    ["odd:justify-start"]: !isEven,
  });

  return (
    <div className="flex even:flex-row-reverse gap-6 max-md:gap-16 items-center w-full max-w-[1250px] mx-auto max-md:!flex-col max-md:items-center">
      <div className="w-full md:max-w-[300px]" style={{ flex: 2 }}>
        <h3 className="text-[#360B58] font-bold text-4xl max-md:text-3xl leading-relaxed">
          {title}
        </h3>
        <p className="mt-3 text-base">{body}</p>
      </div>
      <div className={imageContainerStyling} style={{ flex: 4 }}>
        <div className="w-full max-w-[700px] relative">
          <div className="overflow-hidden max-h-[690px] flex items-center">
            <video
              autoPlay={true}
              muted={true}
              loop={true}
              className="!bg-transparent"
            >
              <source src={videoSrc} type="video/mp4" />
            </video>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DescriptionItem;
