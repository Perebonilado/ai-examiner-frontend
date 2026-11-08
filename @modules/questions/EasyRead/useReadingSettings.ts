import { useCallback, useEffect, useState } from "react";
import {
  FitMode,
  ScrollMode,
  TEXT_SIZE_DEFAULT,
  TEXT_SIZE_MAX,
  TEXT_SIZE_MIN,
} from "./types";

const STORAGE_KEY = "aix-easy-read-settings";

export interface ReadingSettings {
  scrollMode: ScrollMode;
  /** Simplified text size in px. */
  textSize: number;
  /** Original page size: fit width, fit page, or the custom zoom below. */
  fit: FitMode;
  /** Custom zoom for the original (1 = printed size), used when fit is null. */
  zoom: number;
  /** Desktop: the topics panel is open (Hide folds it to a slim tab). */
  topicsOpen: boolean;
}

const DEFAULTS: ReadingSettings = {
  scrollMode: "continuous",
  textSize: TEXT_SIZE_DEFAULT,
  fit: "width",
  zoom: 1,
  topicsOpen: true,
};

const clampSize = (n: number) => Math.min(TEXT_SIZE_MAX, Math.max(TEXT_SIZE_MIN, Math.round(n)));

/** Easy Read's layout, text size and original page size, remembered in this browser
    (like EasiRead's reading comfort). */
const useReadingSettings = () => {
  const [settings, setSettings] = useState<ReadingSettings>(DEFAULTS);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved && typeof saved === "object") {
        setSettings({
          scrollMode: saved.scrollMode === "single" ? "single" : "continuous",
          textSize: clampSize(Number(saved.textSize) || TEXT_SIZE_DEFAULT),
          fit: saved.fit === "page" || saved.fit === null ? saved.fit : "width",
          zoom: Math.min(3, Math.max(0.5, Number(saved.zoom) || 1)),
          topicsOpen: saved.topicsOpen !== false,
        });
      }
    } catch {
      // Storage unavailable: keep the defaults.
    }
  }, []);

  const update = useCallback((patch: Partial<ReadingSettings>) => {
    setSettings((prev) => {
      const next = {
        ...prev,
        ...patch,
        textSize: clampSize(patch.textSize ?? prev.textSize),
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Not saved; still applies for this visit.
      }
      return next;
    });
  }, []);

  return { ...settings, update };
};

export default useReadingSettings;
