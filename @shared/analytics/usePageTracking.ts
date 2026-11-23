import { useEffect } from "react";
import { useRouter } from "next/router";
import { flush, setRoute, track } from "./track";

const MAX_ERRORS_PER_PAGE = 5;

/**
 * Page views and time on each page (counting only while the tab is visible), plus script errors.
 * Mounted once in _app.
 */
export const usePageTracking = () => {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    let current = router.pathname;
    let visibleSince: number | null = document.visibilityState === "visible" ? Date.now() : null;
    let visibleMs = 0;
    let errors = 0;

    const visibleTime = () => visibleMs + (visibleSince ? Date.now() - visibleSince : 0);
    const enter = (pattern: string, ref?: string) => {
      current = pattern;
      setRoute(pattern);
      visibleMs = 0;
      visibleSince = document.visibilityState === "visible" ? Date.now() : null;
      errors = 0;
      track("page_view", { ref });
    };
    const leave = () => track("page_leave", { page: current }, visibleTime());

    enter(router.pathname, document.referrer ? new URL(document.referrer).hostname : undefined);

    const onRoute = () => {
      if (router.pathname === current) return;
      leave();
      enter(router.pathname);
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        if (visibleSince) visibleMs += Date.now() - visibleSince;
        visibleSince = null;
        flush(true);
      } else visibleSince = Date.now();
    };
    const onHide = () => {
      leave();
      flush(true);
    };
    const onError = (e: ErrorEvent) => {
      if (errors++ >= MAX_ERRORS_PER_PAGE) return;
      track("js_error", { message: String(e.message || "error").slice(0, 200), source: (e.filename || "").split("/").pop() });
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      if (errors++ >= MAX_ERRORS_PER_PAGE) return;
      const r = e.reason as { message?: unknown } | undefined;
      track("js_error", { message: String(r?.message ?? r ?? "unhandled rejection").slice(0, 200), source: "promise" });
    };

    router.events.on("routeChangeComplete", onRoute);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onHide);
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      router.events.off("routeChangeComplete", onRoute);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onHide);
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
    // Set up once the router knows the first page; later pages come through routeChangeComplete.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);
};
