import { useEffect, useRef, useState } from "react";
import {
  flushEasyReadUsage,
  useRecordEasyReadUsageMutation,
} from "@/api-services/easy-read.service";
import { EasyReadAllowanceModel } from "@/models/easy-read.model";

const REPORT_EVERY_SECONDS = 15;
/** No scroll, tap, key or pointer movement for this long: the reader has stepped away. */
const IDLE_AFTER_MS = 5 * 60 * 1000;

interface Options {
  allowance?: EasyReadAllowanceModel;
  /** Count time only while the reader is actually showing a document. */
  running: boolean;
  /** The document being read, so reading time is kept per document. */
  documentId?: string;
}

/**
 * Easy Read clock. Counts reading time once a second while the reader is open, the tab is
 * visible and the reader isn't idle, and reports it every 15 seconds (and when the tab is
 * hidden or the reader closes). Every plan reports, so the team can see how long people read;
 * students never see that figure. On the free plan it also counts the monthly allowance down,
 * taking the server's figure as the truth whenever it replies.
 */
const useEasyReadTimer = ({ allowance, running, documentId }: Options) => {
  const limited = !!allowance?.limited;
  const [remaining, setRemaining] = useState<number | null>(null);
  const unsent = useRef(0);
  const lastInput = useRef(Date.now());
  const doc = useRef(documentId);
  doc.current = documentId;
  const [recordUsage] = useRecordEasyReadUsageMutation();

  // The server's figure (first load, then every report's reply).
  useEffect(() => {
    setRemaining(allowance?.limited ? allowance.remainingSeconds ?? 0 : null);
  }, [allowance?.limited, allowance?.remainingSeconds]);

  // Any sign of reading keeps the clock going.
  useEffect(() => {
    const touch = () => {
      lastInput.current = Date.now();
    };
    const events = ["pointermove", "pointerdown", "keydown", "wheel", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, touch, { passive: true, capture: true }));
    return () => events.forEach((e) => window.removeEventListener(e, touch, { capture: true }));
  }, []);

  // Free plan: only while minutes are left. Paid plans: whenever a document is showing.
  const active = running && (!limited || (remaining ?? 0) > 0);

  useEffect(() => {
    if (!active) return;
    lastInput.current = Date.now();
    const id = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastInput.current > IDLE_AFTER_MS) return;
      unsent.current += 1;
      if (limited) setRemaining((r) => (r === null ? r : Math.max(0, r - 1)));
      if (unsent.current >= REPORT_EVERY_SECONDS) {
        const seconds = unsent.current;
        unsent.current = 0;
        recordUsage({ seconds, documentId: doc.current });
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [active, limited, recordUsage]);

  // Out of time: send what's left to report straight away.
  useEffect(() => {
    if (limited && remaining === 0 && unsent.current > 0) {
      const seconds = unsent.current;
      unsent.current = 0;
      recordUsage({ seconds, documentId: doc.current });
    }
  }, [limited, remaining, recordUsage]);

  // Leaving the tab or the reader: report the last few seconds (survives page unload).
  useEffect(() => {
    const flush = () => {
      const seconds = unsent.current;
      unsent.current = 0;
      flushEasyReadUsage(seconds, doc.current);
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, []);

  return {
    limited,
    remaining,
    outOfTime: limited && remaining !== null && remaining <= 0,
  };
};

export default useEasyReadTimer;

/** 450 -> "7:30" */
export const formatClock = (seconds: number) => {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

/** 450 -> "7 min", 40 -> "under 1 min" */
export const formatMinutesLeft = (seconds: number) => {
  const minutes = Math.floor(Math.max(0, seconds) / 60);
  return minutes >= 1 ? `${minutes} min` : "under 1 min";
};
