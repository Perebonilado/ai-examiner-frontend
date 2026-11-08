import React, { FC, useEffect, useState } from "react";
import cn from "classnames";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import Link from "next/link";
import Cookies from "js-cookie";
import { Library, PanelLeftClose, PanelLeftOpen, Plus, X } from "lucide-react";
import { RootState } from "@/config/redux-config";
import { toggleNavigation } from "@/features/navigationSlice";
import { useGetAllUserDocumentsQuery } from "@/api-services/document.service";
import { accessToken, typeBasedRoutes } from "@/constants";
import CollapsibleButton from "./CollapsibleButton";
import RecentDocumentContainer from "./RecentDocumentContainer";
import UserLogoutBox from "./UserLogoutBox";
import AppMark from "./AppMark";

/** True on marketing routes, and on shared routes when nobody is signed in. */
export const useIsWebRoute = () => {
  const router = useRouter();
  const [isWebRoute, setIsWebRoute] = useState(true);

  useEffect(() => {
    const userIsLoggedIn = Cookies.get(accessToken);
    const activeRoute = typeBasedRoutes.find((r) => r.route === router.pathname);

    if (!activeRoute) setIsWebRoute(false);
    else if (activeRoute.type === "web") setIsWebRoute(true);
    else setIsWebRoute(!userIsLoggedIn);
  }, [router.pathname]);

  return isWebRoute;
};

interface ContentProps {
  collapsed?: boolean;
  /** Mobile drawer: shows a close button instead of the collapse control. */
  drawer?: boolean;
  onClose?: () => void;
  onNavigate?: () => void;
}

export const SidebarContent: FC<ContentProps> = ({
  collapsed = false,
  drawer = false,
  onClose,
  onNavigate,
}) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const isWebRoute = useIsWebRoute();

  const { data: recentDocuments } = useGetAllUserDocumentsQuery(
    { courseId: "", page: 1, pageSize: 5, title: "", id: "" },
    { skip: isWebRoute }
  );

  const pathname = router.pathname;
  const isNewDoc = pathname === "/new-document";
  const isAllDocs = pathname === "/documents";
  const openDocId =
    pathname === "/questions/view-questions/[id]" ? String(router.query.id ?? "") : "";

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col bg-rail py-3",
        collapsed ? "items-center px-2.5" : "px-3"
      )}
    >
      {/* Head: logo + collapse */}
      <div
        className={cn(
          "mb-3.5 flex items-center",
          collapsed
            ? "flex-col gap-2"
            : "h-10 justify-between pl-1.5 pr-0.5"
        )}
      >
        <AppMark markOnly={collapsed} onClick={onNavigate} />
        {drawer ? (
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-lg text-subtle transition-colors hover:bg-hover hover:text-ink"
          >
            <X size={18} strokeWidth={1.75} aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => dispatch(toggleNavigation(collapsed))}
            className="grid h-9 w-9 place-items-center rounded-lg text-subtle transition-colors hover:bg-hover hover:text-ink"
          >
            {collapsed ? (
              <PanelLeftOpen size={18} strokeWidth={1.75} aria-hidden="true" />
            ) : (
              <PanelLeftClose size={18} strokeWidth={1.75} aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      {/* Primary action */}
      <Link
        href="/new-document"
        onClick={onNavigate}
        aria-current={isNewDoc ? "page" : undefined}
        title={collapsed ? "New document" : undefined}
        aria-label={collapsed ? "New document" : undefined}
        className={cn(
          "mb-3.5 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand text-sm font-semibold tracking-[-0.005em] text-white shadow-[0_1px_2px_rgba(16,12,40,0.18)] transition-colors hover:bg-brand-hover",
          collapsed ? "w-11" : "w-full px-4"
        )}
      >
        <Plus size={18} strokeWidth={1.75} aria-hidden="true" />
        {!collapsed && <span>New document</span>}
      </Link>

      <nav aria-label="Main" className="flex w-full flex-col items-center gap-0.5">
        <CollapsibleButton
          collapsed={collapsed}
          icon={<Library strokeWidth={1.75} aria-hidden="true" />}
          isActive={isAllDocs}
          title="All documents"
          link="/documents"
          callBackOnClick={onNavigate}
        />
      </nav>

      {!collapsed && (
        <div className="min-h-0 w-full flex-1 overflow-y-auto">
          <RecentDocumentContainer
            data={
              recentDocuments?.documents?.map((t) => ({
                link: `/questions/view-questions/${t.id}`,
                title: t.title,
                isActive: t.id === openDocId,
                callbackOnClick: onNavigate,
              })) ?? []
            }
          />
        </div>
      )}

      <UserLogoutBox collapsed={collapsed} />
    </div>
  );
};

/** Desktop sidebar: 256px, or a 68px icon rail when collapsed. */
const Sidebar: FC = () => {
  const { navOpen: isOpen } = useSelector(
    (state: RootState) => state.navigationSliceReducer
  );

  return (
    <aside
      aria-label="Sidebar"
      className={cn(
        "sticky top-0 h-screen shrink-0 border-r border-line bg-rail transition-[width] duration-300 ease-out-expo",
        isOpen ? "w-64 overflow-hidden" : "w-[68px] overflow-visible"
      )}
    >
      <SidebarContent collapsed={!isOpen} />
    </aside>
  );
};

export default Sidebar;
