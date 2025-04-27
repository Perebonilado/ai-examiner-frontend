import React, { FC } from "react";
import PageControls from "./PageControls";
import ExpandIconAlt from "@/icons/ExpandIconAlt";
import Image from "next/image";

interface Props {
  handleExpand: () => void;
  totalCount: number;
  currentPage: number;
  handleNextPage: () => void;
  handlePreviousPage: () => void;
  imageSrc: string;
}

const ViewImageContainer: FC<Props> = ({
  handleExpand,
  imageSrc,
  ...pageControl
}) => {
  return (
    <div className="flex flex-col">
      <div className="w-full h-[300px] relative border border-[#9E69E3] mb-3 rounded-2xl p-4">
        <button
          className="absolute top-2 right-2 z-[200]"
          onClick={handleExpand}
        >
          <ExpandIconAlt />
        </button>
        <div className="relative mx-auto w-full max-w-[80%] h-full">
          <Image
            layout="fill"
            objectFit="contain"
            objectPosition="50% 50%"
            src={imageSrc}
            alt={""}
          />
        </div>
      </div>
      <PageControls {...pageControl} />
    </div>
  );
};

export default ViewImageContainer;
