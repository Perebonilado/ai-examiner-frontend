import { useCallback } from "react";
import { useRouter } from "next/router";

type Patch = Record<string, string | number | undefined | null>;

/**
 * Filters kept in the address bar, so a refresh, the back button or a shared link keeps them.
 * Empty values are dropped. Updates replace the history entry and don't scroll.
 */
export const useUrlState = () => {
  const router = useRouter();

  const get = useCallback(
    (name: string): string | undefined => {
      const value = router.query[name];
      return typeof value === "string" && value !== "" ? value : undefined;
    },
    [router.query]
  );

  const set = useCallback(
    (patch: Patch) => {
      const query: Record<string, string | string[]> = {};
      for (const [k, v] of Object.entries(router.query)) if (v !== undefined) query[k] = v;
      for (const [k, v] of Object.entries(patch)) {
        if (v === undefined || v === null || v === "") delete query[k];
        else query[k] = String(v);
      }
      router.replace({ pathname: router.pathname, query }, undefined, { shallow: true, scroll: false });
    },
    [router]
  );

  return { ready: router.isReady, query: router.query, get, set };
};
