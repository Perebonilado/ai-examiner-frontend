import React, { FC, useEffect } from "react";
import cn from "classnames";
import { X } from "lucide-react";
import { navLinks } from "@/constants";
import NavLink from "./NavLink";
import AppMark from "./AppLayout/AppMark";
import { SidebarContent, useIsWebRoute } from "./AppLayout/Sidebar";

interface Props {
  isSideNav: boolean;
  handleCloseSidebar: () => void;
}

/** Phone drawer: the same sidebar, sliding in from the left over a scrim. */
const MobileSidebar: FC<Props> = ({ isSideNav, handleCloseSidebar }) => {
  const isWebRoute = useIsWebRoute();

  useEffect(() => {
    window.addEventListener("resize", handleCloseSidebar);
    return () => window.removeEventListener("resize", handleCloseSidebar);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isSideNav) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && handleCloseSidebar();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isSideNav, handleCloseSidebar]);

  return (
    <div className="md:hidden" aria-hidden={!isSideNav}>
      <div
        onClick={handleCloseSidebar}
        className={cn(
          "fixed inset-0 z-[60] bg-[rgba(15,12,24,0.4)] transition-opacity duration-300",
          isSideNav ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={cn(
          "fixed inset-y-0 left-0 z-[61] w-[min(86vw,320px)] shadow-[0_0_60px_rgba(0,0,0,0.25)] transition-transform duration-300 ease-out-expo",
          isSideNav ? "translate-x-0" : "invisible -translate-x-full"
        )}
      >
        {isWebRoute ? (
          <div className="flex h-full flex-col gap-6 bg-rail px-4 py-3">
            <div className="flex h-10 items-center justify-between">
              <AppMark onClick={handleCloseSidebar} />
              <button
                type="button"
                aria-label="Close menu"
                onClick={handleCloseSidebar}
                className="grid h-10 w-10 place-items-center rounded-lg text-subtle hover:bg-hover hover:text-ink"
              >
                <X size={18} strokeWidth={1.75} aria-hidden="true" />
              </button>
            </div>
            {navLinks.map((item, idx) => (
              <NavLink {...item} key={idx} />
            ))}
          </div>
        ) : (
          <SidebarContent drawer onClose={handleCloseSidebar} onNavigate={handleCloseSidebar} />
        )}
      </div>
    </div>
  );
};

export default MobileSidebar;
