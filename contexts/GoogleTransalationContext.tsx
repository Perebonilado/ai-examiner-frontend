import { allLanguages } from "@/constants";
import { getUserLanguageCodeFromLocalStorage } from "@/utils";
import React, { FC, PropsWithChildren, useEffect, useState } from "react";

interface ContextOptions {
  isGoogleTranslationReady: boolean;
  selectedLanguageCode: string;
  setSelectedLanguageCode: React.Dispatch<React.SetStateAction<string>>;
  selectedLanguageName: string;
  setSelectedLanguageName: React.Dispatch<React.SetStateAction<string>>;
  selectedLanguageFlag: string;
  setSelectedLanguageFlag: React.Dispatch<React.SetStateAction<string>>;
  isLanguageSet: boolean;
  setIsLanguageSet: React.Dispatch<React.SetStateAction<boolean>>;
}

const GoogleTranslationContext = React.createContext<ContextOptions | null>(
  null
);

const GoogleTranslationProvider: FC<PropsWithChildren> = ({ children }) => {
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [selectedLanguageCode, setSelectedLanguageCode] = useState("en");
  const [selectedLanguageName, setSelectedLanguageName] = useState("English");
  const [selectedLanguageFlag, setSelectedLanguageFlag] = useState("GB");
  const [isLanguageSet, setIsLanguageSet] = useState(true);

  useEffect(() => {
    window.googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        { pageLanguage: "en" },
        "google_translate_element"
      );
      setIsGoogleLoaded(true);
    };
  }, []);

  /**
   *
   * First, check if they have a value in local storage
   * If not, prompt to select a language
   * If they need to generate audio content, pass a language to generate that content in
   */

  useEffect(() => {
    const languageCode = getUserLanguageCodeFromLocalStorage();

    if (languageCode) {
      const language = allLanguages.find((lang) => lang.code === languageCode);

      if (!language) return;

      setSelectedLanguageCode(language.code);
      setSelectedLanguageName(language.name);
      setSelectedLanguageFlag(language.flag);
    } else {
      setIsLanguageSet(false);
    }
  }, []);

  return (
    <GoogleTranslationContext.Provider
      value={{
        isGoogleTranslationReady: isGoogleLoaded,
        selectedLanguageCode,
        setSelectedLanguageCode,
        selectedLanguageName,
        setSelectedLanguageName,
        selectedLanguageFlag,
        setSelectedLanguageFlag,
        isLanguageSet,
        setIsLanguageSet
      }}
    >
      <div id="google_translate_element" style={{ display: "none" }}></div>
      {children}
    </GoogleTranslationContext.Provider>
  );
};

export default GoogleTranslationProvider;

export const useGoogleTranslationContext: () => ContextOptions = () => {
  const context = React.useContext(GoogleTranslationContext);
  if (!context)
    throw new Error("Modal context can only be used within modal provider");
  return context;
};
