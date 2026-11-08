import React, { FC, useEffect, useState } from "react";
import { getSupportedLanguages } from "@/constants";
import {
  useCreatePreferredLanguageMutation,
  useGetPreferredLanguageQuery,
  useUpdatePreferredLanguageMutationMutation,
} from "@/api-services/preferred-language.service";
import { LanguageDialog, LanguageOption } from "./LanguageDialog";
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
    <LanguageDialog
      onClose={() => {
        setModalContent(null);
      }}
      onSave={async () => {
        if (data && data.preferredLanguageSet) {
          await updatePrefLang({ language: selected });
        } else {
          await createPrefLang({ language: selected });
        }
      }}
    >
      {data &&
        getSupportedLanguages()
          .sort()
          .map((lang) => {
            return (
              <LanguageOption
                key={lang.name}
                language={lang.name}
                flag={lang.code}
                selected={selected === lang.name}
                onSelect={() => {
                  setSelected(lang.name);
                }}
              />
            );
          })}
    </LanguageDialog>
  );
};

export default PreferredLanguageModal;
