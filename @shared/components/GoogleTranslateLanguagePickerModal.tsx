import { useModalContext } from "@/contexts/ModalContext";
import React, { FC, useState } from "react";
import { LanguageDialog, LanguageOption } from "./LanguageDialog";
import { allLanguages, DEFAULT_LANGUAGE_ENGLISH_KEY } from "@/constants";
import { useGoogleTranslationContext } from "@/contexts/GoogleTransalationContext";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

const GoogleTranslateLanguagePickerModal: FC = () => {
  const { setModalContent } = useModalContext();
  const {
    isGoogleTranslationReady,
    setSelectedLanguageCode,
    setSelectedLanguageFlag,
    setSelectedLanguageName,
    selectedLanguageCode,
    selectedLanguageFlag,
    selectedLanguageName,
  } = useGoogleTranslationContext();

  const [selectedOption, setSelectedOption] = useState({
    code: selectedLanguageCode,
    language: selectedLanguageName,
    flag: selectedLanguageFlag,
  });

  const changeLanguage = () => {
    const selectElement =
      document.querySelector<HTMLSelectElement>(".goog-te-combo");

    if (!isGoogleTranslationReady || !selectElement) {
      toast.error("Translation is not ready yet");
      window.location.reload();
      return;
    }

    if (selectElement) {
      selectElement.value = selectedOption.code;
      selectElement.dispatchEvent(new Event("change"));
      setSelectedLanguageCode(selectedOption.code);
      setSelectedLanguageFlag(selectedOption.flag);
      setSelectedLanguageName(selectedOption.language);
    }
  };

  const handleClose = () => {
    if (selectedOption.language.toLowerCase() === "english") {
      Cookies.set(DEFAULT_LANGUAGE_ENGLISH_KEY, "true");
    }
    setModalContent(null);
  };

  return (
    <LanguageDialog
      onClose={handleClose}
      onSave={async () => {
        if (selectedOption.language.toLowerCase() === "english") {
          Cookies.set(DEFAULT_LANGUAGE_ENGLISH_KEY, "true");
        }
        changeLanguage();
        setModalContent(null);
      }}
    >
      {allLanguages.map((lang, idx) => {
        return (
          <LanguageOption
            key={idx}
            language={lang.name}
            flag={lang.flag}
            selected={selectedOption.code === lang.code}
            onSelect={() => {
              setSelectedOption({
                language: lang.name,
                code: lang.code,
                flag: lang.flag.toLowerCase(),
              });
            }}
          />
        );
      })}
    </LanguageDialog>
  );
};

export default GoogleTranslateLanguagePickerModal;
