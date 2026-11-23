import React, { FC } from "react";
import { Check } from "lucide-react";
import { SaveStatus } from "./useAutosave";

/** A quiet "Saved" beside the step buttons, announced politely to screen readers. */
const SaveStatusNote: FC<{ status: SaveStatus; onRetry: () => void }> = ({ status, onRetry }) => (
  <span className="inline-flex items-center gap-2 text-[13px] text-subtle">
    <span role="status" aria-live="polite" className="inline-flex items-center gap-1.5">
      {status === "saved" && (
        <>
          <Check size={14} strokeWidth={2.2} aria-hidden="true" className="text-success" />
          Saved
        </>
      )}
      {(status === "saving" || status === "pending") && "Saving…"}
      {status === "error" && <span className="font-semibold text-danger">Couldn&apos;t save</span>}
    </span>
    {status === "error" && (
      <button type="button" onClick={onRetry} className="font-semibold text-accent hover:underline">
        Try again
      </button>
    )}
  </span>
);

export default SaveStatusNote;
