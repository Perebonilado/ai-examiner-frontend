import { useModalContext } from "@/contexts/ModalContext";
import React, { FC } from "react";
import { ChevronDown, Languages } from "lucide-react";
import GoogleTranslateLanguagePickerModal from "./GoogleTranslateLanguagePickerModal";
import { useGoogleTranslationContext } from "@/contexts/GoogleTransalationContext";
import { LanguageFlag } from "./LanguageDialog";

interface Props {
  showLabel?: boolean;
}

/**
 * Opens the language dialog. With a label (desktop top bar): a bordered button with the flag and
 * language name; without (phones, compact bars): a plain icon button.
 */
const GoogleTranslateLanguagePicker: FC<Props> = ({ showLabel = false }) => {
  const { setModalContent } = useModalContext();
  const { selectedLanguageName, selectedLanguageFlag } =
    useGoogleTranslationContext();

  const open = () => {
    setModalContent(<GoogleTranslateLanguagePickerModal />);
  };

  if (!showLabel) {
    return (
      <button
        type="button"
        aria-haspopup="dialog"
        aria-label={`Language: ${selectedLanguageName}`}
        title="Choose language"
        onClick={open}
        className="grid h-10 w-10 place-items-center rounded-lg text-subtle transition-colors hover:bg-hover hover:text-ink"
      >
        <Languages size={20} strokeWidth={1.75} aria-hidden />
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-label={`Language: ${selectedLanguageName}`}
      title="Choose language"
      onClick={open}
      className="inline-flex h-[34px] items-center gap-2 rounded-lg border border-control bg-surface px-2.5 text-[13px] font-semibold text-ink shadow-xs transition-colors hover:bg-well"
    >
      <LanguageFlag
        code={selectedLanguageFlag}
        alt=""
        className="!w-[18px] !h-[13px]"
      />
      <span className="max-w-[140px] truncate">{selectedLanguageName}</span>
      <ChevronDown size={14} strokeWidth={1.75} className="text-faint" aria-hidden />
    </button>
  );
};

export default GoogleTranslateLanguagePicker;
