import React, { forwardRef, PropsWithChildren } from "react";
import Button from "../ui/Button";

interface Props {
  handleUploadFiles: () => void;
  handleCancel: () => void;
  allowedFileSize: number;
  currentFileSize: number;
}

const StagedImagesDialog = forwardRef<HTMLDivElement, PropsWithChildren<Props>>(
  ({ children, handleUploadFiles, handleCancel, allowedFileSize, currentFileSize,}, ref) => {
    return (
      <div
        className="w-full relative max-h-[80vh] min-h-[400px] max-w-[410px] max-md:max-w-[320px] rounded-xl shadow-lg p-4 py-8 flex flex-col gap-10 items-center justify-center bg-white"
        ref={ref}
      >
        <div className="flex flex-col gap-2 h-[5%] w-full">
          {currentFileSize > allowedFileSize && <p className="text-sm text-rose-500 italic text-center">File size ({currentFileSize}mb) exceeds {allowedFileSize}mb</p>}
          <h3 className="max-sm:text-center">Choose Images</h3>
        </div>
        <section className="pt-4 h-[75%] overflow-y-auto">{children}</section>
        <div className="flex items-center justify-end gap-4 w-full h-[20%]">
          <Button title="Upload" onClick={handleUploadFiles} disabled={currentFileSize > allowedFileSize}/>
          <Button
            title="Cancel"
            variant="outlined"
            onClick={() => {
              handleCancel();
            }}
          />
        </div>
      </div>
    );
  }
);

export default StagedImagesDialog;
