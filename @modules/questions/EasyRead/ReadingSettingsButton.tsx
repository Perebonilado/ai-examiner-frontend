import React, { FC, useEffect, useRef, useState } from "react";
import cn from "classnames";
import { ALargeSmall } from "lucide-react";
import ReadingSettingsPanel from "./ReadingSettingsPanel";
import { ReadingSettings } from "./useReadingSettings";

interface Props extends ReadingSettings {
  update: (patch: Partial<ReadingSettings>) => void;
  originalScale?: number;
}

/** Desktop: an "Aa" button in the reader bar that opens the reading settings popover. */
const ReadingSettingsButton: FC<Props> = (props) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        aria-label="Reading settings"
        title="Reading settings"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "grid h-9 w-9 place-items-center rounded-lg transition-colors",
          open ? "bg-hover text-ink" : "text-subtle hover:bg-hover hover:text-ink"
        )}
      >
        <ALargeSmall size={18} strokeWidth={1.75} aria-hidden="true" />
      </button>
      {open && (
        <div
          role="dialog"
          aria-label="Reading settings"
          className="absolute right-0 top-full z-[60] mt-1.5 w-[288px] rounded-[14px] border border-edge bg-surface shadow-pop"
        >
          <ReadingSettingsPanel {...props} />
        </div>
      )}
    </div>
  );
};

export default ReadingSettingsButton;
