/** GET /course-document/simplified-pages/:documentId */
export type SimplifiedPageStatus = "pending" | "running" | "done" | "failed";

export interface SimplifiedPagesModel {
  /** preparing: the document's pages are still being read; working: pages are being simplified. */
  status: "preparing" | "working" | "ready";
  /** Null while preparing. */
  totalPages: number | null;
  pages: {
    pageNumber: number;
    status: SimplifiedPageStatus;
    /** Only for finished pages the app didn't say it already has. */
    html?: string;
  }[];
}
