import React, { FC, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import ReadingSettingsPanel from "./ReadingSettingsPanel";
import { ReadingSettings } from "./useReadingSettings";

interface Props extends ReadingSettings {
  update: (patch: Partial<ReadingSettings>) => void;
  isOpen: boolean;
  onClose: () => void;
}

/** Phone: reading settings as a bottom sheet, opened from the reader's bottom bar. */
const ReadingSettingsSheet: FC<Props> = ({ isOpen, onClose, ...settings }) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="reading-settings-sheet"
          className="fixed inset-0 z-[1001] flex items-end md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <button
            type="button"
            aria-label="Close reading settings"
            tabIndex={-1}
            onClick={onClose}
            className="absolute inset-0 bg-[rgba(15,12,24,.42)]"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Reading settings"
            className="relative w-full rounded-t-[20px] bg-surface pb-[calc(8px+env(safe-area-inset-bottom))] shadow-pop"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            <span aria-hidden="true" className="mx-auto mt-2 block h-1 w-9 rounded-full bg-control" />
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-lg text-subtle hover:bg-hover hover:text-ink"
            >
              <X size={18} strokeWidth={1.75} aria-hidden="true" />
            </button>
            <ReadingSettingsPanel {...settings} variant="sheet" className="pt-3" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReadingSettingsSheet;
