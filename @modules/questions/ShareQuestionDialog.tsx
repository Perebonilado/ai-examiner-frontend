import Button from "@/@shared/ui/Button";
import { useModalContext } from "@/contexts/ModalContext";
import { Copy, Share2, X } from "lucide-react";
import React, { FC } from "react";

interface Props {
  handleCopy: () => void;
}

const ShareQuestionDialog: FC<Props> = ({ handleCopy }) => {
  const { setModalContent } = useModalContext();
  return (
    <div
      role="dialog"
      aria-labelledby="share-question-title"
      className="w-full relative max-w-[340px] max-md:max-w-[92vw] rounded-2xl shadow-pop border border-edge bg-surface px-6 pt-7 pb-[22px] text-center"
    >
      <button
        type="button"
        aria-label="Close"
        className="absolute top-2.5 right-2.5 w-9 h-9 grid place-items-center rounded-lg text-subtle hover:bg-hover hover:text-ink transition-colors"
        onClick={() => {
          setModalContent(null);
        }}
      >
        <X size={18} strokeWidth={1.75} />
      </button>
      <span className="w-[52px] h-[52px] mx-auto mt-1 mb-4 rounded-full grid place-items-center bg-accent-50 text-accent">
        <Share2 size={22} strokeWidth={1.75} />
      </span>
      <h3
        id="share-question-title"
        className="text-lg font-bold text-ink tracking-[-0.02em]"
      >
        Share question
      </h3>
      <div className="mt-[22px]">
        <Button
          title="Copy link"
          size="large"
          fullWidth
          onClick={handleCopy}
          starticon={<Copy size={16} strokeWidth={1.75} />}
        />
      </div>
    </div>
  );
};

export default ShareQuestionDialog;
