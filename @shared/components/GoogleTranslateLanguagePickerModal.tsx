import { useModalContext } from "@/contexts/ModalContext";
import CloseIcon from "@/icons/CloseIcon";
import Image from "next/image";
import React, { FC, useState } from "react";
import cn from "classnames";
import Button from "../ui/Button";
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

  return (
    <div className="w-full max-w-[90vw] md:max-w-[450px] bg-slate-100 rounded-xl max-h-[85vh] p-4 py-7">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-xl">
          Choose your preferred language
        </h2>
        <button
          className="cursor-pointer"
          onClick={() => {
            if (selectedOption.language.toLowerCase() === "english") {
              Cookies.set(DEFAULT_LANGUAGE_ENGLISH_KEY, "true");
            }
            setModalContent(null);
          }}
        >
          <CloseIcon />
        </button>
      </div>

      <div className="my-4 max-h-[50vh] overflow-y-auto  mb-6 flex flex-col gap-2">
        {allLanguages.map((lang, idx) => {
          return (
            <PreferredLanguageItem
              key={idx}
              language={lang.name}
              code={lang.code}
              flag={lang.flag.toLowerCase()}
              selected={selectedOption.code === lang.code}
              handleSelect={(opts) => {
                setSelectedOption(opts);
              }}
            />
          );
        })}
      </div>

      <Button
        title="Save"
        size="large"
        fullWidth
        onClick={async () => {
          if (selectedOption.language.toLowerCase() === "english") {
            Cookies.set(DEFAULT_LANGUAGE_ENGLISH_KEY, "true");
          }
          changeLanguage();
          setModalContent(null);
        }}
      />
    </div>
  );
};

export default GoogleTranslateLanguagePickerModal;

interface SelectLanguage {
  language: string;
  code: string;
  flag: string;
}

interface Props {
  language: string;
  code: string;
  selected: boolean;
  flag: string;
  handleSelect: ({ language, code, flag }: SelectLanguage) => void;
}

const PreferredLanguageItem: FC<Props> = ({
  language,
  selected,
  code,
  handleSelect,
  flag,
}) => {
  const classNames = cn(
    `rounded-xl py-5 px-3 border border-transparent hover:border hover:border-[#9A67E2] cursor-pointer flex items-center`,
    {
      ["bg-[#9A67E2] text-white"]: selected,
    }
  );
  return (
    <button
      className={classNames}
      onClick={() => {
        handleSelect({ language, code, flag });
      }}
    >
      <div className="w-[75%] flex items-center gap-4">
        <div className="w-[30px] h-[30px] relative">
          <Image
            layout="fill"
            objectFit="contain"
            objectPosition="100% 50%"
            src={`https://flagcdn.com/w40/${flag.toLowerCase()}.png`}
            alt={language}
          />
        </div>
        <p>{language}</p>
      </div>
    </button>
  );
};
