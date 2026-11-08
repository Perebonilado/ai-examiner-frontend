import { useModalContext } from "@/contexts/ModalContext";
import CloseIcon from "@/icons/CloseIcon";
import React, { forwardRef } from "react";
import Button from "../ui/Button";

interface Props {
  title: string;
  message: string;
  confirmationText: string;
  cancelText?: string;
  onConfirm: () => any;
  onCancel?: () => void;
}

const ConfirmationDialog = forwardRef<HTMLDivElement, Props>(
  (
    {
      title,
      confirmationText,
      message,
      onConfirm,
      onCancel,
      cancelText = "Cancel",
    },
    ref
  ) => {
    const { setModalContent } = useModalContext();
    return (
      <div
        className="w-full relative overflow-hidden max-w-[400px] max-md:max-w-[92vw] rounded-2xl shadow-pop border border-edge flex flex-col justify-center bg-surface"
        ref={ref}
      >
        <div className="flex items-center justify-end px-4 pt-4">
          <div></div>
          <button
            className="cursor-pointer"
            onClick={() => {
              setModalContent(null);
            }}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="px-5 pb-2">
          <p className="font-bold mb-1 text-left text-lg text-ink">{title}</p>
          <p className="text-sm text-subtle">{message}</p>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 mt-3 border-t border-line bg-canvas">
          <Button
            title={cancelText}
            variant="outlined"
            size="medium"
            onClick={() => {
              if (onCancel) {
                onCancel();
              } else {
                setModalContent(null);
              }
            }}
          />
          <Button
            title={confirmationText}
            variant="contained"
            size="medium"
            onClick={onConfirm}
          />
        </div>
      </div>
    );
  }
);

export default ConfirmationDialog;
