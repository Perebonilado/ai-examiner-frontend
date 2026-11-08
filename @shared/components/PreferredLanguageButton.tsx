import React, { FC, useEffect, useState } from "react";
import { accessToken, getSupportedLanguages } from "@/constants";
import Cookies from "js-cookie";
import { useGetPreferredLanguageQuery } from "@/api-services/preferred-language.service";
import { useModalContext } from "@/contexts/ModalContext";
import PreferredLanguageModal from "./PreferredLanguageModal";
import { LanguageFlag } from "./LanguageDialog";

const PreferredLanguageButton: FC = () => {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [code, setCode] = useState("");

  useEffect(() => {
    const isLoggedIn = Cookies.get(accessToken);

    if (isLoggedIn) {
      setIsUserLoggedIn(true);
    }
  }, [Cookies.get(accessToken)]);

  const { data } = useGetPreferredLanguageQuery("", { skip: !isUserLoggedIn });
  const { setModalContent } = useModalContext();

  useEffect(() => {
    if (data) {
      const code = getSupportedLanguages().find(
        (l) => l.name === data.language
      );
      if (code) {
        setCode(code.code);
      } else {
        setCode("GB");
      }
    }
  }, [data]);

  return !data ? null : (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-label={`Preferred language: ${data.language}`}
      title="Choose your preferred language"
      className="grid h-10 w-10 place-items-center rounded-lg transition-colors hover:bg-hover"
      onClick={() => {
        setModalContent(<PreferredLanguageModal />);
      }}
    >
      <LanguageFlag code={code} alt={data.language} />
    </button>
  );
};

export default PreferredLanguageButton;
