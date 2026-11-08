import React, { FC, ReactNode } from "react";
import { motion } from "framer-motion";
import cn from "classnames";
import { Check, Sparkles, X } from "lucide-react";
import FileTypeTile, {
  FileTypeTileExt,
} from "@/@shared/components/FileTypeTile";
import { useGetFileThumbnailDetailsQuery } from "@/api-services/document.service";
import {
  DocumentFileKind,
  getFileKindFromUrl,
} from "@/@modules/documents/fileKind";

const KIND_TO_EXT: Record<DocumentFileKind, FileTypeTileExt> = {
  pdf: "PDF",
  word: "DOCX",
  slides: "PPTX",
  image: "JPG",
  text: "TXT",
};

/** File-type label for the document being turned into a test (PDF when unknown). */
export const useDocumentFileExt = (
  documentId?: string | null
): FileTypeTileExt => {
  const { data } = useGetFileThumbnailDetailsQuery(
    { documentId: documentId || "" },
    { skip: !documentId }
  );
  const kind = getFileKindFromUrl(data?.iframUrl);
  return kind ? KIND_TO_EXT[kind] : "PDF";
};

/* "Preparing test" / "Your test is ready!" dialog body, on the standard scrim.
   File tile with a sparkle (violet while working, green tick when ready), a flat progress bar
   with the percentage, then the actions. */

const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

interface Props {
  percentage: number;
  fileExt?: FileTypeTileExt;
  title: string;
  message: string;
  actions: ReactNode;
  /** Two buttons side by side on desktop (stacked, primary first, on phones). */
  twoActions?: boolean;
  handleClose?: () => void;
}

const PreparingTestCard: FC<Props> = ({
  percentage,
  fileExt = "PDF",
  title,
  message,
  actions,
  twoActions = true,
  handleClose,
}) => {
  const isReady = percentage >= 100;
  const pct = Math.max(0, Math.min(100, Math.round(percentage)));
  return (
    <motion.div
      className="fixed inset-0 z-[1000] grid place-items-center p-5"
      style={{
        backdropFilter: "blur(2px)",
        background: "rgba(15, 12, 24, 0.42)",
      }}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={fadeVariants}
      transition={{ duration: 0.2 }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="prep-title"
        aria-describedby="prep-desc"
        className="relative w-full max-w-[440px] rounded-2xl bg-surface text-center px-8 pt-9 pb-7 max-md:px-[22px] max-md:pt-[30px] max-md:pb-[22px] shadow-[0_30px_80px_-30px_rgba(15,10,40,0.5),0_0_0_1px_rgba(16,12,40,0.06)]"
      >
        {handleClose && (
          <button
            type="button"
            aria-label="Close"
            onClick={handleClose}
            className="absolute top-3 right-3 w-9 h-9 grid place-items-center rounded-lg text-subtle hover:bg-hover hover:text-ink transition-colors"
          >
            <X size={18} strokeWidth={1.75} aria-hidden />
          </button>
        )}

        <div className="relative w-16 mx-auto" aria-hidden>
          <FileTypeTile ext={fileExt} size="lg" className="mx-auto" />
          <span
            className={cn(
              "absolute -right-2 -bottom-1.5 w-[30px] h-[30px] rounded-full grid place-items-center text-white shadow-[0_0_0_3px_var(--surface)]",
              isReady ? "bg-success" : "bg-accent"
            )}
          >
            {isReady ? (
              <Check size={15} strokeWidth={2.4} />
            ) : (
              <Sparkles size={15} strokeWidth={1.75} />
            )}
          </span>
        </div>

        <h2
          id="prep-title"
          className="mt-[22px] text-[22px] font-bold tracking-[-0.02em] text-ink"
        >
          {title}
        </h2>
        <p
          id="prep-desc"
          className="mx-auto mt-1.5 max-w-[300px] text-[15px] leading-normal text-subtle [text-wrap:balance]"
        >
          {message}
        </p>

        <div className="flex items-center gap-3 mt-[26px]">
          <div
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={isReady ? "Test generated" : "Generating test"}
            className="flex-1 h-2 rounded-full bg-sunken overflow-hidden"
          >
            <span
              className={cn(
                "block h-full rounded-full transition-[width] duration-500 ease-out",
                isReady ? "bg-success" : "bg-accent"
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="min-w-[38px] text-right text-[13px] font-bold text-ink tabular-nums">
            {pct}%
          </span>
        </div>

        <div
          className={cn(
            "grid gap-2.5 mt-[26px]",
            twoActions ? "grid-cols-2 max-md:grid-cols-1" : "grid-cols-1"
          )}
        >
          {actions}
        </div>
      </div>
    </motion.div>
  );
};

export default PreparingTestCard;
