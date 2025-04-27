import React, { FC } from "react";
import Modal from "../Modal";
import FileUploadSpinner from "../FileUploadSpinner";

const ProcessingHandWrittenImagesLoader: FC = () => {
  return (
    <Modal>
      <div className="w-full max-w-[400px] max-sm:max-w-[96vw] flex items-center justify-center p-6 h-[200px] max-sm:h-[230px] shadow-md bg-white border border-dashed rounded-3xl">
        <FileUploadSpinner
          title={`Processing your material`}
        />
      </div>
    </Modal>
  );
};

export default ProcessingHandWrittenImagesLoader;
