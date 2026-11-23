import { useEffect, useRef } from "react";
import { stopwatch, track } from "./track";

/**
 * A practice test from opening to the end: opened, finished (with the score and time), or left
 * part-way (closing the tab or going elsewhere with answers given but not submitted).
 */
export const useTestTracking = (t: {
  type: string;
  testId: string;
  total: number;
  answered: number;
  /** The test has loaded and its saved progress is known. */
  ready: boolean;
  /** It was already finished before this visit. */
  alreadyDone: boolean;
}) => {
  const latest = useRef(t);
  latest.current = t;
  const opened = useRef(false);
  const done = useRef(false);
  const took = useRef<() => number>(stopwatch());

  useEffect(() => {
    if (!t.ready || !t.testId || opened.current) return;
    opened.current = true;
    done.current = t.alreadyDone;
    took.current = stopwatch();
    track("test_opened", { type: t.type, testId: t.testId, total: t.total, resumed: t.answered > 0, finishedBefore: t.alreadyDone });
  }, [t.ready, t.testId, t.type, t.total, t.answered, t.alreadyDone]);

  useEffect(() => {
    const leave = () => {
      const c = latest.current;
      if (!opened.current || done.current || c.answered === 0) return;
      done.current = true;
      track("test_left", { type: c.type, testId: c.testId, answered: c.answered, total: c.total }, took.current());
    };
    window.addEventListener("pagehide", leave);
    return () => {
      window.removeEventListener("pagehide", leave);
      leave();
    };
  }, []);

  return {
    submitted: (score: number) => {
      const c = latest.current;
      if (done.current && !opened.current) return;
      done.current = true;
      track(
        "test_submitted",
        { type: c.type, testId: c.testId, total: c.total, answered: c.answered, score: Math.round(score) },
        took.current()
      );
    },
  };
};
