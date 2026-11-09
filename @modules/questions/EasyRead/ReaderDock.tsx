import React, { FC } from "react";
import Link from "next/link";
import { ALargeSmall, ChevronLeft, List } from "lucide-react";
import ReaderSegmented from "./ReaderSegmented";
import { ReaderMode } from "./types";

interface Props {
  backHref: string;
  mode: ReaderMode;
  onModeChange: (mode: ReaderMode) => void;
  /** Read / total topics, or null when the document has no paged topics. */
  topics: { read: number; total: number } | null;
  onOpenTopics: () => void;
  onOpenSettings: () => void;
}

/** Phone reader bar, floating at the bottom: back, Original/Simplified, reading settings, Topics. */
const ReaderDock: FC<Props> = ({
  backHref,
  mode,
  onModeChange,
  topics,
  onOpenTopics,
  onOpenSettings,
}) => {
  return (
    <nav
      aria-label="Reader"
      className="fixed inset-x-2.5 bottom-[calc(10px+env(safe-area-inset-bottom))] z-40 flex h-14 items-center gap-1.5 rounded-[18px] border border-line bg-surface-glass px-1.5 shadow-lift backdrop-blur-md md:hidden"
    >
      <Link
        href={backHref}
        aria-label="Back to the document"
        className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-subtle transition-colors hover:bg-hover hover:text-ink"
      >
        <ChevronLeft size={20} strokeWidth={1.75} aria-hidden="true" />
      </Link>

      <ReaderSegmented
        size="dock"
        value={mode === "split" ? "original" : mode}
        onChange={onModeChange}
        options={[{ value: "original" }, { value: "simplified" }]}
      />

      <button
        type="button"
        onClick={onOpenSettings}
        aria-haspopup="dialog"
        aria-label="Reading settings"
        className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-subtle transition-colors hover:bg-hover hover:text-ink"
      >
        <ALargeSmall size={19} strokeWidth={1.75} aria-hidden="true" />
      </button>

      {topics && (
        <button
          type="button"
          onClick={onOpenTopics}
          aria-haspopup="dialog"
          aria-label={`Topics, ${topics.read} of ${topics.total} read`}
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl px-2.5 text-[13px] font-semibold tabular-nums text-ink transition-colors hover:bg-hover"
        >
          <List size={18} strokeWidth={1.75} className="text-subtle" aria-hidden="true" />
          {topics.read}/{topics.total}
        </button>
      )}
    </nav>
  );
};

export default ReaderDock;
