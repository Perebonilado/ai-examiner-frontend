import FileUploadSpinner from "@/@shared/components/FileUploadSpinner";
import Modal from "@/@shared/components/Modal";
import React, { FC } from "react";

const LoadingReader: FC = () => {
  return (
    <Modal>
      <div className="w-full max-w-[400px] max-sm:max-w-[96vw] flex items-center justify-center p-6 h-[200px] max-sm:h-[230px] shadow-md bg-white border border-dashed rounded-3xl">
        <FileUploadSpinner
          title={`One moment... getting your files`}
          showIcon={false}
        />
      </div>
    </Modal>
  );
};

export default LoadingReader;
