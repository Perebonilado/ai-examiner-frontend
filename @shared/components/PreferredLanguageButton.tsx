import Image from "next/image";
import React, { FC, useEffect, useState } from "react";
import { accessToken, getSupportedLanguages } from "@/constants";
import Cookies from "js-cookie";
import { useGetPreferredLanguageQuery } from "@/api-services/preferred-language.service";
import { useModalContext } from "@/contexts/ModalContext";
import PreferredLanguageModal from "./PreferredLanguageModal";

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
      className="w-[30px] h-[30px] relative"
      onClick={() => {
        setModalContent(<PreferredLanguageModal />);
      }}
    >
      <Image
        layout="fill"
        objectFit="contain"
        objectPosition="100% 50%"
        src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
        alt={data.language}
      />
    </button>
  );
};

export default PreferredLanguageButton;
