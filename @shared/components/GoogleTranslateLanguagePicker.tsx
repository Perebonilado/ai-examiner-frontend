import { useModalContext } from "@/contexts/ModalContext";
import Image from "next/image";
import React, { FC } from "react";
import GoogleTranslateLanguagePickerModal from "./GoogleTranslateLanguagePickerModal";
import { useGoogleTranslationContext } from "@/contexts/GoogleTransalationContext";
import ArrowDownStub from "@/icons/ArrowDownStub";

interface Props {
  showLabel?: boolean;
}

const GoogleTranslateLanguagePicker: FC<Props> = ({ showLabel = false }) => {
  const { setModalContent } = useModalContext();
  const { selectedLanguageName, selectedLanguageFlag, isLanguageSet } =
    useGoogleTranslationContext();

  return (
    <button
      className="flex items-center gap-2"
      onClick={() => {
        setModalContent(<GoogleTranslateLanguagePickerModal />);
      }}
    >
      {showLabel && <p className="font-medium text-xs">Choose Language</p>}
      <div className="flex items-center gap-1">
        <div className="w-[30px] h-[30px] relative">
          <Image
            layout="fill"
            objectFit="contain"
            objectPosition="100% 50%"
            src={`https://flagcdn.com/w40/${selectedLanguageFlag.toLowerCase()}.png`}
            alt={selectedLanguageName}
          />
        </div>
        <ArrowDownStub />
      </div>
    </button>
  );
};

export default GoogleTranslateLanguagePicker;
