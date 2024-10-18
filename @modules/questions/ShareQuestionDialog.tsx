import Button from "@/@shared/ui/Button";
import { useModalContext } from "@/contexts/ModalContext";
import CloseIcon from "@/icons/CloseIcon";
import CopyIcon from "@/icons/CopyIcon";
import React, { FC } from "react";

interface Props {
  handleCopy: () => void;
}

const ShareQuestionDialog: FC<Props> = ({ handleCopy }) => {
  const { setModalContent } = useModalContext();
  return (
    <div className="w-full relative max-w-[300px] max-md:max-w-[320px] rounded-xl shadow-lg p-4 py-6 flex flex-col gap-10 items-center justify-center bg-white">
      <span
        className="absolute top-3 right-3 cursor-pointer"
        onClick={() => {
          setModalContent(null);
        }}
      >
        <CloseIcon />
      </span>
      <section className="pt-4">
        <div className="flex flex-col items-center justify-center gap-4">
          <h3 className="text-lg font-bold">Share Question</h3>
          <Button title="Copy Link" size="large" onClick={handleCopy} starticon={<CopyIcon width={20} height={20}/>}/>
        </div>
      </section>
    </div>
  );
};

export default ShareQuestionDialog;
