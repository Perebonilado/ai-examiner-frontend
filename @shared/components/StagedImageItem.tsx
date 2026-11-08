import { X } from "lucide-react";
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
    <div className="relative w-full max-w-[300px] aspect-[13/12] flex-shrink-0 rounded-xl bg-sunken overflow-hidden shadow-[inset_0_0_0_1px_var(--line)]">
      <Image
        layout="fill"
        objectFit="contain"
        objectPosition="50% 50%"
        src={imageSrc}
        alt={file.name}
      />
      <button
        type="button"
        aria-label={`Remove ${file.name}`}
        className="absolute top-2 right-2 z-10 w-8 h-8 grid place-items-center rounded-full bg-surface text-subtle shadow-soft hover:text-ink transition-colors"
        onClick={() => {
          handleDelete(id);
        }}
      >
        <X size={16} strokeWidth={1.75} />
      </button>
    </div>
  );
};

export default StagedImageItem;
