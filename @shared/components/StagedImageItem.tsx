import CloseIcon from "@/icons/CloseIcon";
import Image from "next/image";
import React, { FC } from "react";

export interface StagedImage {
  file: File;
  id: number;
}

export interface Props {
  data: StagedImage;
  handleDelete: (id: number) => void;
}

const StagedImageItem: FC<Props> = ({ data: { file, id }, handleDelete }) => {
  const imageSrc = URL.createObjectURL(file);
  return (
    <div className="relative w-[170px] h-[170px] border rounded-lg">
      <button
        className="absolute bottom-[85%] right-1 z-[200]"
        onClick={() => {
          handleDelete(id);
        }}
      >
        <CloseIcon />
      </button>
      <Image
        layout="fill"
        objectFit="contain"
        objectPosition="50% 50%"
        src={imageSrc}
        alt={file.name}
      />
    </div>
  );
};

export default StagedImageItem;
