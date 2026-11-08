import React, { FC, PropsWithChildren, useEffect, useRef } from "react";
import Image from "next/image";
import cn from "classnames";
import { Check, X } from "lucide-react";
import Button from "../ui/Button";

/** Small rounded flag (flagcdn PNG by ISO country code). */
export const LanguageFlag: FC<{ code: string; alt: string; className?: string }> = ({
  code,
  alt,
  className,
}) => (
  <span
    className={cn(
      "relative block w-[22px] h-4 shrink-0 overflow-hidden rounded-[3px] shadow-[0_0_0_0.5px_rgba(0,0,0,0.18)]",
      className
    )}
  >
    {code ? (
      <Image
        fill
        sizes="22px"
        className="object-cover"
        src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
        alt={alt}
      />
    ) : null}
  </span>
);

interface DialogProps {
  onClose: () => void;
  onSave: () => void;
}

/** "Choose your preferred language": scrolling list, selected row tinted, Save in the footer. */
export const LanguageDialog: FC<PropsWithChildren<DialogProps>> = ({
  onClose,
  onSave,
  children,
}) => {
  const listRef = useRef<HTMLDivElement>(null);

  // Open with the current language in view.
  useEffect(() => {
    const selected = listRef.current?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (selected && listRef.current) {
      listRef.current.scrollTop =
        selected.offsetTop - listRef.current.clientHeight / 2 + selected.clientHeight / 2;
    }
  }, []);

  return (
    <div
      role="dialog"
      aria-labelledby="language-dialog-title"
      className="w-[400px] max-w-[calc(100vw-32px)] overflow-hidden rounded-2xl border border-edge bg-surface shadow-pop"
    >
      <div className="flex items-start gap-3 px-5 pt-5">
        <h2
          id="language-dialog-title"
          className="flex-1 text-lg font-bold tracking-[-0.015em] text-ink"
        >
          Choose your preferred language
        </h2>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="-mt-2 -mr-2 grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-hover hover:text-ink"
        >
          <X size={18} strokeWidth={1.75} />
        </button>
      </div>

      <div
        ref={listRef}
        role="listbox"
        aria-labelledby="language-dialog-title"
        className="relative mt-2.5 max-h-[min(296px,50vh)] overflow-y-auto px-3 py-1 [mask-image:linear-gradient(transparent,#000_12px,#000_calc(100%-28px),transparent)]"
      >
        {children}
        <div className="h-4" aria-hidden />
      </div>

      <div className="border-t border-line bg-canvas px-5 py-3.5">
        <Button title="Save" size="medium" fullWidth onClick={onSave} />
      </div>
    </div>
  );
};

interface OptionProps {
  language: string;
  flag: string;
  selected: boolean;
  onSelect: () => void;
}

export const LanguageOption: FC<OptionProps> = ({ language, flag, selected, onSelect }) => (
  <button
    type="button"
    role="option"
    aria-selected={selected}
    onClick={onSelect}
    className={cn(
      "flex h-11 w-full items-center gap-3 rounded-[10px] px-3 text-left text-sm transition-colors",
      {
        "bg-accent-50 font-semibold text-accent-900 shadow-[inset_0_0_0_1px_var(--accent-200)]": selected,
        "font-medium text-body hover:bg-hover": !selected,
      }
    )}
  >
    <LanguageFlag code={flag} alt="" />
    <span className="min-w-0 flex-1 truncate">{language}</span>
    {selected && (
      <Check size={16} strokeWidth={2.5} className="shrink-0 text-accent" aria-hidden />
    )}
  </button>
);
