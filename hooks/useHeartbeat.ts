import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "@/config/redux-config";
import { useSendHeartbeatMutation } from "@/api-services/admin.service";
import { capitalizeFirstLetterOfEachWord } from "@/utils";

const BEAT_MS = 60_000;
const MAX_DOING = 140;

/** What the person is doing on this route, in words for the admin "Online now" list. */
export const doingForRoute = (pathname: string, documentTitle: string | null): string | null => {
  if (pathname.startsWith("/easy-read/"))
    return documentTitle ? `Reading in Easy Read · ${documentTitle}` : "Reading in Easy Read";
  if (pathname.startsWith("/questions/practise-questions/oral-(viva)")) return "In an oral viva";
  if (pathname.includes("/flash-cards/")) return "Studying flashcards";
  if (pathname.startsWith("/questions/practise-questions/") || pathname.startsWith("/questions/shared/"))
    return "Taking a test";
  if (pathname === "/new-document" || pathname === "/documents" || pathname.startsWith("/documents/"))
    return "Browsing documents";
  return null;
};

/**
 * Tells the server this person is here and what they are doing: once when a page opens (and when
 * the route changes), then every minute while the tab is visible. Failures are silent.
 */
export const useHeartbeat = (enabled: boolean) => {
  const router = useRouter();
  const [sendHeartbeat] = useSendHeartbeatMutation();
  const { documentIdInView, documentTitleInView } = useSelector((state: RootState) => state.documentChatReducer);

  const path = router.asPath.split(/[?#]/)[0];
  // The title in the store belongs to the document in the URL only when the ids match.
  const routeId = typeof router.query.id === "string" ? router.query.id : "";
  const title =
    documentTitleInView && (!routeId || routeId === documentIdInView)
      ? capitalizeFirstLetterOfEachWord(documentTitleInView.toLowerCase())
      : null;
  const doing = doingForRoute(router.pathname, title)?.slice(0, MAX_DOING) ?? null;

  const latest = useRef({ doing, path });
  latest.current = { doing, path };

  // On open, on route change, and when the document's title arrives.
  useEffect(() => {
    if (!enabled || !router.isReady) return;
    sendHeartbeat({ doing, path });
  }, [enabled, router.isReady, doing, path, sendHeartbeat]);

  // Every minute while the tab is visible, and straight away when it becomes visible again.
  useEffect(() => {
    if (!enabled) return;
    const beat = () => {
      if (document.visibilityState === "visible") sendHeartbeat(latest.current);
    };
    const timer = setInterval(beat, BEAT_MS);
    document.addEventListener("visibilitychange", beat);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", beat);
    };
  }, [enabled, sendHeartbeat]);
};
