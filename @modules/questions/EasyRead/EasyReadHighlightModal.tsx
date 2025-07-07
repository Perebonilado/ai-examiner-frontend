import React, { FC } from "react";
import EasyReadIllustration from "./EasyReadIllustration";
import CloseIcon from "@/icons/CloseIcon";

interface Props {
  handleClose: () => void;
}

const EasyReadHighlightModal: FC<Props> = ({ handleClose }) => {
  return (
    <div className="w-full max-w-[800px] max-md:max-w-[95%] bg-white rounded-xl py-14 px-6 flex items-center justify-center relative">
      <button className="absolute top-4 right-4" onClick={handleClose}>
        <CloseIcon />
      </button>
      <div className="flex items-center justify-center w-full max-w-[650px] gap-8">
        <div className="max-md:hidden">
          <EasyReadIllustration />
        </div>
        <div className="flex-1">
          <h2 className="font-bold text-4xl text-[#9333EA] italic max-sm:text-3xl m-0 mb-1">
            Easy Read
          </h2>
          <h2 className="font-bold text-4xl max-sm:text-3xl m-0 mb-6">
            Learn with confidence
          </h2>
          <p className="bg-[#E1F3FF] p-4 text-lg max-sm:text-base rounded-xl">
            Highlight any text to get explanations, simplifications, definitions
            and even images to support you while studying.
          </p>
          <p className="bg-[#F3FFE1] p-4 text-lg max-sm:text-base rounded-xl">
            Store new words in your deck to create flashcards manually.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EasyReadHighlightModal;
