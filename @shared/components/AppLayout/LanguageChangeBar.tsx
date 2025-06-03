import React, { FC } from "react";
import GoogleTranslateLanguagePicker from "../GoogleTranslateLanguagePicker";

const LanguageChangeBar: FC = () => {
  return (
    <div className="w-full h-[50px] pt-6 flex items-center justify-end pr-4">
      <GoogleTranslateLanguagePicker showLabel={true} />
    </div>
  );
};

export default LanguageChangeBar;
