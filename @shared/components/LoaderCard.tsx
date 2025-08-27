import React, { FC } from "react";
import FileUploadSpinner from "./FileUploadSpinner";

interface Props {
  message?: string;
}

const LoaderCard: FC<Props> = ({ message = "Loading" }) => {
  return (
    <div className="w-full max-w-[400px] max-sm:max-w-[96vw] flex items-center justify-center p-6 h-[200px] max-sm:h-[230px] shadow-md bg-white border border-dashed rounded-3xl">
      <FileUploadSpinner
        title={message}
        showIcon={false}
      />
    </div>
  );
};

export default LoaderCard;
