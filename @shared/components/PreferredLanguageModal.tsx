import React, { FC, useEffect, useState } from "react";
import Button from "../ui/Button";
import { getSupportedLanguages } from "@/constants";
import {
  useCreatePreferredLanguageMutation,
  useGetPreferredLanguageQuery,
  useUpdatePreferredLanguageMutationMutation,
} from "@/api-services/preferred-language.service";
import cn from "classnames";
import Image from "next/image";
import CloseIcon from "@/icons/CloseIcon";
import { useModalContext } from "@/contexts/ModalContext";

const PreferredLanguageModal: FC = () => {
  const { data } = useGetPreferredLanguageQuery("");
  const [selected, setSelected] = useState("");

  useEffect(() => {
    if (data) {
      setSelected(data.language);
    }
  }, [data]);

  const { setModalContent } = useModalContext();

  const [createPrefLang] = useCreatePreferredLanguageMutation();
  const [updatePrefLang] = useUpdatePreferredLanguageMutationMutation();
  return (
    <div className="w-full max-w-[90vw] md:max-w-[450px] bg-slate-200 rounded-xl max-h-[75vh] p-4 py-7">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-xl">
          Choose your preferred language
        </h2>
        <button
          className="cursor-pointer"
          onClick={() => {
            setModalContent(null);
          }}
        >
          <CloseIcon />
        </button>
      </div>
      <div className="my-4 max-h-[50vh] overflow-y-auto  mb-6 flex flex-col gap-2">
        {data &&
          getSupportedLanguages()
            .sort()
            .map((lang) => {
              return (
                <PreferredLanguageItem
                  language={lang.name}
                  code={lang.code}
                  selected={selected === lang.name}
                  handleSelect={(lang) => {
                    setSelected(lang);
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
          if (data && data.preferredLanguageSet) {
            await updatePrefLang({ language: selected });
          } else {
            await createPrefLang({ language: selected });
          }
        }}
      />
    </div>
  );
};

export default PreferredLanguageModal;

interface Props {
  language: string;
  code: string;
  selected: boolean;
  handleSelect: (lang: string) => void;
}

const PreferredLanguageItem: FC<Props> = ({
  language,
  selected,
  code,
  handleSelect,
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
        handleSelect(language);
      }}
    >
      <div className="w-[75%] flex items-center gap-4">
        <div className="w-[30px] h-[30px] relative">
          <Image
            layout="fill"
            objectFit="contain"
            objectPosition="100% 50%"
            src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
            alt={language}
          />
        </div>
        <p>{language}</p>
      </div>
    </button>
  );
};
