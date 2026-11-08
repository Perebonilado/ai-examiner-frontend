import { useEffect, useRef, useState } from "react";
import {
  flushEasyReadUsage,
  useRecordEasyReadUsageMutation,
} from "@/api-services/easy-read.service";
import { EasyReadAllowanceModel } from "@/models/easy-read.model";

const REPORT_EVERY_SECONDS = 15;

interface Options {
  allowance?: EasyReadAllowanceModel;
  /** Count time only while the reader is actually showing a document. */
  running: boolean;
}

/**
 * Free plan Easy Read clock. Counts down once a second while the reader is open and the tab is
 * visible, reports the time to the server every 15 seconds (and when the tab is hidden or the
 * reader closes), and takes the server's figure as the truth whenever it replies.
 */
const useEasyReadTimer = ({ allowance, running }: Options) => {
  const limited = !!allowance?.limited;
  const [remaining, setRemaining] = useState<number | null>(null);
  const unsent = useRef(0);
  const [recordUsage] = useRecordEasyReadUsageMutation();

  // The server's figure (first load, then every report's reply).
  useEffect(() => {
    setRemaining(allowance?.limited ? allowance.remainingSeconds ?? 0 : null);
  }, [allowance?.limited, allowance?.remainingSeconds]);

  const active = limited && running && (remaining ?? 0) > 0;

  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      unsent.current += 1;
      setRemaining((r) => (r === null ? r : Math.max(0, r - 1)));
      if (unsent.current >= REPORT_EVERY_SECONDS) {
        const seconds = unsent.current;
        unsent.current = 0;
        recordUsage({ seconds });
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [active, recordUsage]);

  // Out of time: send what's left to report straight away.
  useEffect(() => {
    if (limited && remaining === 0 && unsent.current > 0) {
      const seconds = unsent.current;
      unsent.current = 0;
      recordUsage({ seconds });
    }
  }, [limited, remaining, recordUsage]);

  // Leaving the tab or the reader: report the last few seconds (survives page unload).
  useEffect(() => {
    if (!limited) return;
    const flush = () => {
      const seconds = unsent.current;
      unsent.current = 0;
      flushEasyReadUsage(seconds);
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
  }, [limited]);

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
