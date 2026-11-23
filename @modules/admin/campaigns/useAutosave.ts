import { useCallback, useEffect, useRef, useState } from "react";

export type SaveStatus = "idle" | "pending" | "saving" | "saved" | "error";

/**
 * Saves `value` a moment after it stops changing. `baseline` is what the server already has:
 * nothing is sent until the value differs from it. `flush` saves straight away (before leaving).
 */
export const useAutosave = <T>(
  value: T | null,
  baseline: T | null,
  save: (value: T) => Promise<unknown>,
  delay = 800
) => {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const saved = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef<T | null>(value);
  const saveRef = useRef(save);
  saveRef.current = save;
  latest.current = value;

  // The server's copy, once it has loaded.
  useEffect(() => {
    if (baseline !== null && saved.current === null) saved.current = JSON.stringify(baseline);
  }, [baseline]);

  const run = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const current = latest.current;
    if (current === null || saved.current === null) return true;
    const json = JSON.stringify(current);
    if (json === saved.current) return true;
    setStatus("saving");
    try {
      await saveRef.current(current);
      saved.current = json;
      // Typing went on while saving: the next timer picks it up.
      setStatus(JSON.stringify(latest.current) === json ? "saved" : "pending");
      return true;
    } catch {
      setStatus("error");
      return false;
    }
  }, []);

  useEffect(() => {
    if (value === null || saved.current === null) return;
    if (JSON.stringify(value) === saved.current) return;
    setStatus((s) => (s === "saving" ? s : "pending"));
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(run, delay);
  }, [value, delay, run]);

  // Leaving the page (Close, a step link) still saves the last change.
  useEffect(
    () => () => {
      if (timer.current) run();
    },
    [run]
  );

  // Closing the tab with a change not yet saved: ask first.
  useEffect(() => {
    if (status !== "pending" && status !== "saving" && status !== "error") return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [status]);

  return { status, flush: run };
};
