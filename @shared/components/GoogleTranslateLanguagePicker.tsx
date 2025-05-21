import { useModalContext } from "@/contexts/ModalContext";
import Image from "next/image";
import React, { FC, useEffect } from "react";
import GoogleTranslateLanguagePickerModal from "./GoogleTranslateLanguagePickerModal";
import { useGoogleTranslationContext } from "@/contexts/GoogleTransalationContext";
import Cookies from "js-cookie";
import { DEFAULT_LANGUAGE_ENGLISH_KEY } from "@/constants";
import ArrowDownStub from "@/icons/ArrowDownStub";

const GoogleTranslateLanguagePicker: FC = () => {
  const { setModalContent } = useModalContext();
  const { selectedLanguageName, selectedLanguageFlag, isLanguageSet } =
    useGoogleTranslationContext();

  // useEffect(() => {
  //   const isDefaultLangEnglish = Cookies.get(DEFAULT_LANGUAGE_ENGLISH_KEY);
  //   if (!isLanguageSet && isDefaultLangEnglish != "true") {
  //     setModalContent(<GoogleTranslateLanguagePickerModal />);
  //   }
  // }, [isLanguageSet]);

  return (
    <button className="flex items-center gap-1">
      <div
        className="w-[30px] h-[30px] relative"
        onClick={() => {
          setModalContent(<GoogleTranslateLanguagePickerModal />);
        }}
      >
        <Image
          layout="fill"
          objectFit="contain"
          objectPosition="100% 50%"
          src={`https://flagcdn.com/w40/${selectedLanguageFlag.toLowerCase()}.png`}
          alt={selectedLanguageName}
        />
      </div>
      <ArrowDownStub />
    </button>
  );
};

export default GoogleTranslateLanguagePicker;
