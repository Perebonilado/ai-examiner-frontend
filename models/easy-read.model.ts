/** GET /easy-read/allowance and POST /easy-read/usage. */
export interface EasyReadAllowanceModel {
  /** False on a paid plan: no limit. */
  limited: boolean;
  limitSeconds: number | null;
  usedSeconds: number;
  remainingSeconds: number | null;
  /** When the free minutes refill (ISO date), or null on a paid plan. */
  resetsOn: string | null;
}

/** The API's 403 body when a free user has no Easy Read time left. */
export const EASY_READ_LIMIT_REACHED = "EASY_READ_LIMIT_REACHED";

/** True for the API's "no free Easy Read time left" error (an RTK Query error object). */
export const isEasyReadLimitError = (error: unknown) => {
  const e = error as { status?: number; data?: { code?: string } } | undefined;
  return e?.status === 403 && e?.data?.code === EASY_READ_LIMIT_REACHED;
};
