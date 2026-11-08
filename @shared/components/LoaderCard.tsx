import React, { FC } from "react";
import FileUploadSpinner from "./FileUploadSpinner";

interface Props {
  message?: string;
}

/* Calm white card with a spinner, used inside a modal while work finishes. */
const LoaderCard: FC<Props> = ({ message = "Loading" }) => {
  return (
    <div className="w-full max-w-[400px] max-sm:max-w-[92vw] grid place-items-center px-6 py-10 rounded-2xl bg-surface shadow-[0_30px_80px_-30px_rgba(15,10,40,0.5),0_0_0_1px_rgba(16,12,40,0.06)]">
      <FileUploadSpinner title={message} showIcon={false} />
    </div>
  );
};

export default LoaderCard;
