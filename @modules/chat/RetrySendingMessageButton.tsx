import Button from "@/@shared/ui/Button";
import ErrorMessage from "@/@shared/ui/ErrorMessage/ErrorMessage";
import React, { FC } from "react";

interface Props {
  handleRetry: () => void;
}

const RetrySendingMessageButton: FC<Props> = ({ handleRetry }) => {
  return (
    <div className="gap-2 items-center justify-center">
      <ErrorMessage message={`Oops! we had an issue sending your message`} />
      <Button
        title="Retry"
        variant="outlined"
        size="small"
        className="mx-auto"
        onClick={handleRetry}
      />
    </div>
  );
};

export default RetrySendingMessageButton;
