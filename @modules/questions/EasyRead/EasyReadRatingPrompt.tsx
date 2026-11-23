import React, { FC, useEffect, useState } from "react";
import { X } from "lucide-react";
import RateThis from "@/@shared/components/RateThis";
import { useGetMyRatingsQuery } from "@/api-services/feedback.service";

/** How long someone reads before we ask (a first glance isn't enough to judge). */
const ASK_AFTER_MS = 4 * 60_000;
const seenKey = (documentId: string) => `easy-read-rated:${documentId}`;

const seen = (documentId: string) => {
  try {
    return localStorage.getItem(seenKey(documentId)) === "1";
  } catch {
    return false;
  }
};
const remember = (documentId: string) => {
  try {
    localStorage.setItem(seenKey(documentId), "1");
  } catch {
    // Private mode: the prompt may come back next time, which is fine.
  }
};

/**
 * A small card, a few minutes into reading, asking whether Easy Read helps with this document.
 * Asked once per document: closing it or rating it puts it away.
 */
const EasyReadRatingPrompt: FC<{ documentId: string; reading: boolean }> = ({ documentId, reading }) => {
  const [due, setDue] = useState(false);
  const [closed, setClosed] = useState(true);
  const { data } = useGetMyRatingsQuery({ kind: "easy_read", ids: [documentId] }, { skip: !documentId || !due });

  useEffect(() => {
    if (!documentId) return;
    setClosed(seen(documentId));
  }, [documentId]);

  useEffect(() => {
    if (!reading || closed || due) return;
    const t = setTimeout(() => setDue(true), ASK_AFTER_MS);
    return () => clearTimeout(t);
  }, [reading, closed, due]);

  const close = () => {
    remember(documentId);
    setClosed(true);
  };

  // Already rated (on another device, say): don't ask again.
  const already = data?.[documentId] !== undefined;
  if (!due || closed || !reading || !data || already) return null;

  return (
    <div
      role="region"
      aria-label="Rate Easy Read"
      className="fixed inset-x-3 bottom-[calc(76px+env(safe-area-inset-bottom))] z-30 mx-auto flex max-w-[380px] items-start gap-2 rounded-2xl border border-line bg-surface px-4 py-3 shadow-lift md:inset-x-auto md:bottom-6 md:left-6 md:mx-0"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-[13.5px] font-semibold text-ink">Is Easy Read helping with this document?</p>
        <RateThis
          kind="easy_read"
          itemId={documentId}
          subject="Easy Read for this document"
          className="-ml-1.5"
          onRated={() => {
            remember(documentId);
            setTimeout(() => setClosed(true), 1600);
          }}
        />
      </div>
      <button
        type="button"
        onClick={close}
        aria-label="Close"
        className="-mr-1.5 -mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-subtle transition-colors hover:bg-hover hover:text-ink"
      >
        <X size={16} strokeWidth={1.75} aria-hidden />
      </button>
    </div>
  );
};

export default EasyReadRatingPrompt;
