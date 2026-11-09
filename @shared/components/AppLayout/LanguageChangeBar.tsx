import React, { FC } from "react";
import { ChevronDown, Languages } from "lucide-react";
import cn from "classnames";
import { useModalContext } from "@/contexts/ModalContext";
import { useGoogleTranslationContext } from "@/contexts/GoogleTransalationContext";
import GoogleTranslateLanguagePickerModal from "../GoogleTranslateLanguagePickerModal";
import { LanguageFlag } from "../LanguageDialog";

interface Props {
  /** Icon-only button for the phone bar. */
  compact?: boolean;
  className?: string;
}

/** Language picker trigger: a bordered pill with the flag and language name. */
const LanguageChangeBar: FC<Props> = ({ compact = false, className }) => {
  const { setModalContent } = useModalContext();
  const { selectedLanguageName, selectedLanguageFlag } =
    useGoogleTranslationContext();

  const open = () => setModalContent(<GoogleTranslateLanguagePickerModal />);

  if (compact) {
    return (
      <button
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        aria-label={`Language: ${selectedLanguageName}. Change language`}
        title={`Language: ${selectedLanguageName}`}
        className={cn(
          "grid h-10 w-10 place-items-center rounded-lg text-subtle transition-colors hover:bg-hover hover:text-ink",
          className
        )}
      >
        <Languages size={18} strokeWidth={1.75} aria-hidden="true" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={open}
      aria-haspopup="dialog"
      aria-label={`Language: ${selectedLanguageName}. Change language`}
      className={cn(
        "notranslate inline-flex h-[34px] items-center gap-2 rounded-lg border border-control bg-surface px-2.5 text-[13px] font-semibold text-ink transition-colors hover:border-control-strong hover:bg-well",
        className
      )}
    >
      <LanguageFlag code={selectedLanguageFlag} alt="" className="!h-[13px] !w-[18px]" />
      <span>{selectedLanguageName}</span>
      <ChevronDown size={14} strokeWidth={1.75} aria-hidden="true" className="text-faint" />
    </button>
  );
};

export default LanguageChangeBar;
