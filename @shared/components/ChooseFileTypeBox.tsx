import React, { FC } from "react";
import Button from "../ui/Button";

interface Props {
  handleSelectImages: () => void;
  handleSelectFiles: () => void;
}

const ChooseFileTypeBox: FC<Props> = ({
  handleSelectFiles,
  handleSelectImages,
}) => {
  return (
    <div className="bg-white rounded-xl border border-grey-200 absolute bottom-full -right-8 w-full max-w-[145px] flex flex-col px-2">
      <div className="border-b border-b-gray-300 p-4">
        <Button
          title="Select Images"
          variant="text"
          type="button"
          size="small"
          onClick={handleSelectImages}
        />
      </div>
      <div className="p-4">
        <Button
          title="Select File"
          variant="text"
          size="small"
          type="button"
          onClick={handleSelectFiles}
        />
      </div>
    </div>
  );
};

export default ChooseFileTypeBox;
