/** How Easy Read shows the document: the PDF, the simplified pages, or both next to each other. */
export type ReaderMode = "original" | "simplified" | "split";

export const READER_MODE_LABELS: Record<ReaderMode, string> = {
  original: "Original",
  simplified: "Simplified",
  split: "Side by side",
};

/** "continuous": every page in one scroll. "single": one page at a time, turned with ↑ / ↓. */
export type ScrollMode = "continuous" | "single";

export const TEXT_SIZE_MIN = 14;
export const TEXT_SIZE_MAX = 22;
export const TEXT_SIZE_DEFAULT = 16;

/** Original page size: fit the pane's width, fit a whole page, or a custom zoom (null). */
export type FitMode = "width" | "page" | null;

/** Zoom steps for the original PDF; 1 = the page at its printed size. */
export const ZOOM_STEPS = [0.5, 0.67, 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3];
export const nextZoomStep = (scale: number) =>
  ZOOM_STEPS.find((step) => step > scale + 0.005) ?? ZOOM_STEPS[ZOOM_STEPS.length - 1];
export const prevZoomStep = (scale: number) =>
  [...ZOOM_STEPS].reverse().find((step) => step < scale - 0.005) ?? ZOOM_STEPS[0];
