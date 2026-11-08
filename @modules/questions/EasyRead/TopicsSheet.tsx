import React, { FC, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import TopicsContainer from "./TopicsContainer";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

/** Phone: the topics panel as a bottom sheet, opened from the reader's bottom bar (above the chat button). */
const TopicsSheet: FC<Props> = ({ isOpen, onClose }) => {
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
          key="topics-sheet"
          className="fixed inset-0 z-[1001] flex items-end md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <button
            type="button"
            aria-label="Close topics"
            tabIndex={-1}
            onClick={onClose}
            className="absolute inset-0 bg-[rgba(15,12,24,.42)]"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Topics"
            className="relative flex max-h-[82dvh] w-full flex-col overflow-hidden rounded-t-[20px] bg-surface pb-[env(safe-area-inset-bottom)] shadow-pop"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            <span aria-hidden="true" className="mx-auto mt-2 block h-1 w-9 shrink-0 rounded-full bg-control" />
            <TopicsContainer className="min-h-0 flex-1" onClose={onClose} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TopicsSheet;
