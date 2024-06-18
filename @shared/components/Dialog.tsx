import CloseIcon from "@/icons/CloseIcon";
import React, { FC, PropsWithChildren } from "react";
import { useModalContext } from "@/contexts/ModalContext";

const Dialog: FC<PropsWithChildren> = ({ children }) => {
  const { setModalContent } = useModalContext();
  return (
    <div className="w-full relative max-w-[400px] max-md:max-w-[320px] rounded-xl shadow-lg p-8 py-14 flex flex-col gap-10 items-center justify-center bg-white">
      <span
        className="absolute top-3 right-3 cursor-pointer"
        onClick={() => {
          setModalContent(null);
        }}
      >
        <CloseIcon />
      </span>
      <section className="pt-4">{children}</section>
    </div>
  );
};

export default Dialog;
