import React, { FC } from "react";
import StagedImageItem, { StagedImage } from "./StagedImageItem";

interface Props {
  data: StagedImage[];
  handleDelete: (id: number) => void;
}

const StagedImageItemContainer: FC<Props> = ({ data, handleDelete }) => {
  return (
    <div className="flex items-center justify-center gap-4 flex-wrap">
      {data.map((img, idx) => {
        return <StagedImageItem data={img} handleDelete={handleDelete} key={idx} />;
      })}
    </div>
  );
};

export default StagedImageItemContainer;
