import React, { FC, ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import LanguageChangeBar from "@/@shared/components/AppLayout/LanguageChangeBar";
import ReaderSegmented from "./ReaderSegmented";
import ReadingSettingsButton from "./ReadingSettingsButton";
import { ReadingSettings } from "./useReadingSettings";
import { ReaderMode } from "./types";

interface Props {
  backHref: string;
  documentTitle?: string;
  mode: ReaderMode;
  onModeChange: (mode: ReaderMode) => void;
  settings: ReadingSettings & {
    update: (patch: Partial<ReadingSettings>) => void;
    originalScale?: number;
  };
  /** Free plan: Easy Read time left this month. */
  timePill?: ReactNode;
}

/** Desktop reader bar: back to the document, the view switch, reading settings and the language picker. */
const ReaderChrome: FC<Props> = ({
  backHref,
  documentTitle,
  mode,
  onModeChange,
  settings,
  timePill,
}) => {
  const backLabel = documentTitle ? `Back to ${documentTitle}` : "Back to the document";

  return (
    <header className="hidden h-[60px] shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2.5 border-b border-line bg-surface pl-5 pr-4 md:grid">
      <Link
        href={backHref}
        title={backLabel}
        aria-label={backLabel}
        className="inline-flex h-10 min-w-0 items-center gap-1 justify-self-start pr-1.5 text-[13.5px] font-semibold text-subtle transition-colors hover:text-ink"
      >
        <ChevronLeft size={16} strokeWidth={1.75} className="shrink-0" aria-hidden="true" />
        <span className="max-w-[260px] truncate">{documentTitle || "Back"}</span>
      </Link>

      <ReaderSegmented
        value={mode}
        onChange={onModeChange}
        options={[
          { value: "original" },
          { value: "simplified" },
          // Two panes need room: only offered from 1280px.
          { value: "split", className: "hidden xl:inline-block" },
        ]}
      />

      <div className="flex items-center justify-end gap-2">
        {timePill}
        <ReadingSettingsButton {...settings} />
        <LanguageChangeBar />
      </div>
    </header>
  );
};

export default ReaderChrome;
