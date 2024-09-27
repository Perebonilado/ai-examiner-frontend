import { useModalContext } from "@/contexts/ModalContext";
import CloseIcon from "@/icons/CloseIcon";
import React, { forwardRef } from "react";
import Button from "../ui/Button";

interface Props {
  title: string;
  message: string;
  confirmationText: string;
  cancelText?: string
  onConfirm: () => any;
}

const ConfirmationDialog = forwardRef<HTMLDivElement, Props>(
  ({ title, confirmationText, message, onConfirm, cancelText = 'Cancel' }, ref) => {
    const { setModalContent } = useModalContext();
    return (
      <div
        className="w-full relative overflow-hidden max-w-[400px] max-md:max-w-[350px] rounded-xl shadow-lg flex flex-col justify-center bg-white"
        ref={ref}
      >
        <div className="flex items-center justify-between p-4 bg-gray-100">
          <p className="font-medium text-left">{title}</p>
          <button
            className="cursor-pointer"
            onClick={() => {
              setModalContent(null);
            }}
          >
            <CloseIcon />
          </button>
        </div>

        <p className="text-gray-500 text-sm border-b p-4">{message}</p>

        <div className="flex items-center justify-end gap-2 p-4">
          <Button
            title={cancelText}
            variant="outlined"
            size="medium"
            onClick={() => {
              setModalContent(null);
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
