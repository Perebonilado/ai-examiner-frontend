import CloseIcon from "@/icons/CloseIcon";
import React, { FC, forwardRef, PropsWithChildren } from "react";
import { useModalContext } from "@/contexts/ModalContext";

const Dialog = forwardRef<HTMLDivElement, PropsWithChildren>(
  ({ children }, ref) => {
    const { setModalContent } = useModalContext();
    return (
      <div
        className="w-full relative max-w-[400px] max-md:max-w-[320px] max-sm:max-w-[95vw] rounded-xl shadow-lg p-4 py-14 flex flex-col gap-10 items-center justify-center bg-white"
        ref={ref}
      >
        <button
          className="absolute top-5 right-5 cursor-pointer"
          onClick={() => {
            setModalContent(null);
          }}
        >
          <CloseIcon />
        </button>
        <section className="pt-4">{children}</section>
      </div>
    );
  }
);

export default Dialog;
