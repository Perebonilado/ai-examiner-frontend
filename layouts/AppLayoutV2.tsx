import React, { FC, PropsWithChildren, useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "@/config/redux-config";
import { capitalizeFirstLetterOfEachWord } from "@/utils";
import cn from "classnames";
import Sidebar from "@/@shared/components/AppLayout/Sidebar";
import TopNav, { Crumb } from "@/@shared/components/AppLayout/TopNav";
import MobileAppNav from "@/@shared/components/MobileAppNav";
import MobileSidebar from "@/@shared/components/MobileSidebar";
import { useIsLoggedIn } from "@/hooks/useIsLoggedIn";

export type { Crumb };

const ALL_DOCS: Crumb = { label: "All documents", href: "/documents" };

const MODE_LABELS: Record<string, string> = {
  "multiple-choice": "Multiple choice",
  "multiple-true-false": "Multiple true-false",
  "flash-cards": "Flashcards",
  essay: "Essay",
  "oral-(viva)": "Oral (viva)",
};

interface OpenDocument {
  id: string;
  title: string;
}

/** Breadcrumbs for routes whose page does not pass its own.
    `doc` is the document the page has put in view (documentChatSlice), when known. */
const routeCrumbs = (pathname: string, doc: OpenDocument | null): Crumb[] => {
  const docCrumb = (asLink: boolean): Crumb[] =>
    doc ? [{ label: doc.title, href: asLink ? `/questions/view-questions/${doc.id}` : undefined }] : [];

  const practise = pathname.match(/^\/questions\/practise-questions\/([^/]+)\//)?.[1];
  if (practise) return [ALL_DOCS, ...docCrumb(true), { label: MODE_LABELS[practise] ?? "Test" }];

  const shared = pathname.match(/^\/questions\/shared\/([^/]+)\//)?.[1];
  if (shared) return [{ label: MODE_LABELS[shared] ?? "Test" }];

  switch (pathname) {
    case "/documents":
      return [{ label: "All documents" }];
    case "/new-document":
      return [{ label: "New document" }];
    case "/account/profile":
      return [{ label: "Account", href: "/account/profile" }, { label: "Profile" }];
    case "/account/settings":
      return [{ label: "Account", href: "/account/profile" }, { label: "Settings" }];
    case "/account/call-credits":
      return [
        { label: "Account", href: "/account/profile" },
        { label: "Settings", href: "/account/settings" },
        { label: "Call credits" },
      ];
    case "/questions/view-questions/[id]":
    case "/documents/[id]":
      return [ALL_DOCS, ...(doc ? docCrumb(false) : [{ label: "Document" }])];
    case "/performance-tracking/question/[id]":
      return [ALL_DOCS, ...docCrumb(true), { label: "Performance overview" }];
    case "/performance-tracking/[id]":
      return [{ label: "Performance" }];
    case "/sprint-read/[id]":
      return [ALL_DOCS, ...docCrumb(true), { label: "Sprint read" }];
    case "/easy-read/[id]":
      return [ALL_DOCS, ...docCrumb(true), { label: "Easy Read" }];
    default:
      return [];
  }
};

/** Phone bar title for routes that show one instead of the logo. */
const routeMobileTitle = (pathname: string, crumbs: Crumb[], hasBack: boolean) => {
  if (pathname === "/account/profile") return "Profile";
  if (pathname === "/account/settings") return "Settings";
  if (hasBack) return crumbs[crumbs.length - 1]?.label;
  return undefined;
};

interface Props {
  handleBack?: () => void;
  noPadding?: boolean;
  /** "reader": no desktop top bar and no phone bar; the page draws its own chrome (Easy Read). */
  variant?: "default" | "reader";
  /** Desktop breadcrumbs. Defaults to crumbs derived from the route. */
  crumbs?: Crumb[];
  /** Phone bar title (shown next to the back button). Defaults to the last crumb. */
  mobileTitle?: string;
}

const AppLayoutV2: FC<PropsWithChildren<Props>> = ({
  children,
  handleBack,
  noPadding = false,
  variant = "default",
  crumbs,
  mobileTitle,
}) => {
  const [isSideNav, setIsSideNav] = useState(false);
  const { pathname, query } = useRouter();
  const { documentIdInView, documentTitleInView } = useSelector(
    (state: RootState) => state.documentChatReducer
  );
  const { isLoggedIn } = useIsLoggedIn();

  const isReader = variant === "reader";
  // The document page's own id is in the URL; only trust the stored title when it matches.
  const docMatchesRoute =
    pathname !== "/questions/view-questions/[id]" || String(query.id ?? "") === documentIdInView;
  const openDoc =
    documentIdInView && documentTitleInView && docMatchesRoute
      ? { id: documentIdInView, title: capitalizeFirstLetterOfEachWord(documentTitleInView.toLowerCase()) }
      : null;
  const trail = crumbs ?? routeCrumbs(pathname, openDoc);
  const phoneTitle = mobileTitle ?? routeMobileTitle(pathname, trail, !!handleBack);

  return (
    <div className="min-h-[100dvh] bg-surface md:flex md:h-screen md:overflow-hidden">
      {!isReader && (
        <>
          <MobileAppNav
            isSideNav={isSideNav}
            isLoggedIn={isLoggedIn}
            handleClick={() => setIsSideNav(!isSideNav)}
            handleBack={handleBack}
            title={phoneTitle}
          />
          <MobileSidebar
            isSideNav={isSideNav}
            handleCloseSidebar={() => setIsSideNav(false)}
          />
        </>
      )}

      {/* Desktop sidebar */}
      <div className="max-md:hidden">
        <Sidebar />
      </div>

      <main
        className={cn(
          "flex min-w-0 flex-1 flex-col md:h-screen",
          isReader ? "md:overflow-hidden" : "md:overflow-y-auto"
        )}
      >
        {!isReader && <TopNav crumbs={trail} handleBack={handleBack} />}

        <div
          className={cn("flex-1", {
            "flex min-h-0 flex-col": isReader,
            "px-4 pb-12 pt-5 md:px-10 md:pb-16 md:pt-8": !noPadding && !isReader,
          })}
        >
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayoutV2;
