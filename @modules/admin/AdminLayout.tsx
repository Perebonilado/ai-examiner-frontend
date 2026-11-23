import React, { FC, PropsWithChildren, useEffect, useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import cn from "classnames";
import {
  Activity,
  ChartSpline,
  ChevronLeft,
  FileText,
  Inbox,
  LayoutDashboard,
  Lightbulb,
  ListChecks,
  LucideIcon,
  Mail,
  Menu,
  MessagesSquare,
  Monitor,
  Moon,
  Sun,
  PanelsTopLeft,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { JetBrains_Mono } from "next/font/google";
import AppHead from "@/@shared/components/AppHead";
import AppMark from "@/@shared/components/AppLayout/AppMark";
import { ThemePreference, useTheme } from "@/contexts/ThemeContext";
import { useGetFollowUpsQuery } from "@/api-services/admin.service";
import { AdminGate } from "./useAdminAccess";
import { AskButton, AskProvider } from "./insights/AskPanel";

// Figures, axis labels and timestamps on the admin pages.
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" });

/**
 * Chart colours. The seven categorical steps are in an order checked for colour-blind
 * separation in both themes (dataviz validator); the sequential steps run light to dark.
 */
const VIZ_CSS = `
  :root {
    --font-mono: ${mono.style.fontFamily};
    --viz-1: #1baf7a; --viz-2: #2a78d6; --viz-3: #eb6834; --viz-4: #6250d6;
    --viz-5: #eda100; --viz-6: #e87ba4; --viz-7: #008300;
    --viz-primary: #6d28d9; --viz-prev: #a1a1aa; --viz-grid: #f0f0f3; --viz-axis: #d4d4da;
    --viz-bar: #f1f0f5;
    --seq-0: #f1f0f5; --seq-1: #ede9fe; --seq-2: #ddd6fe; --seq-3: #c4b5fd; --seq-4: #a78bfa;
    --seq-5: #8b5cf6; --seq-6: #7c3aed; --seq-7: #6d28d9; --seq-8: #4c1d95;
    --seq-fg-low: #0b0b0c; --seq-fg-high: #ffffff;
    --mood-satisfied: #2f9e6e; --mood-neutral: #c4c4cc; --mood-frustrated: #e5484d; --mood-unclear: #eda100;
  }
  :root[data-theme="dark"] {
    --viz-1: #199e70; --viz-2: #3987e5; --viz-3: #d95926; --viz-4: #9085e9;
    --viz-5: #c98500; --viz-6: #d55181; --viz-7: #0ca30c;
    --viz-primary: #a78bfa; --viz-prev: #6b6b76; --viz-grid: #222228; --viz-axis: #3a3a42;
    --viz-bar: #24232a;
    --seq-0: #26252c; --seq-1: #2a2340; --seq-2: #382c5e; --seq-3: #4a3a80; --seq-4: #5f49a6;
    --seq-5: #7a62cf; --seq-6: #9884ea; --seq-7: #b8a8f7; --seq-8: #d9cfff;
    --seq-fg-low: #f3f3f5; --seq-fg-high: #17171b;
    --mood-satisfied: #199e70; --mood-neutral: #4b4b55; --mood-frustrated: #e5484d; --mood-unclear: #d9a21b;
  }
`;

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  isCurrent: (pathname: string) => boolean;
  /** Shows the number of follow-ups waiting for review. */
  badge?: "followUps";
}

const under = (base: string) => (p: string) => p === base || p.startsWith(`${base}/`);

/** The sidebar, in groups: what's happening, what students do, and reaching out to them. */
const NAV: { name?: string; items: NavItem[] }[] = [
  {
    items: [
      { href: "/admin", label: "Overview", icon: LayoutDashboard, isCurrent: (p) => p === "/admin" },
      { href: "/admin/insights", label: "Insights", icon: ChartSpline, isCurrent: under("/admin/insights") },
      { href: "/admin/ideas", label: "Ideas", icon: Lightbulb, isCurrent: under("/admin/ideas") },
    ],
  },
  {
    name: "Students",
    items: [
      { href: "/admin/users", label: "Users", icon: Users, isCurrent: under("/admin/users") },
      { href: "/admin/conversations", label: "Conversations", icon: MessagesSquare, isCurrent: under("/admin/conversations") },
      { href: "/admin/tests", label: "Tests", icon: ListChecks, isCurrent: under("/admin/tests") },
      { href: "/admin/documents", label: "Documents", icon: FileText, isCurrent: under("/admin/documents") },
      { href: "/admin/activity", label: "Activity log", icon: Activity, isCurrent: (p) => p === "/admin/activity" },
    ],
  },
  {
    name: "Reach out",
    items: [
      { href: "/admin/follow-ups", label: "Follow-ups", icon: Inbox, isCurrent: under("/admin/follow-ups"), badge: "followUps" },
      {
        href: "/admin/campaigns",
        label: "Campaigns",
        icon: Mail,
        isCurrent: (p) => p.startsWith("/admin/campaigns") && p !== "/admin/campaigns/new",
      },
      { href: "/admin/campaigns/new", label: "Templates", icon: PanelsTopLeft, isCurrent: (p) => p === "/admin/campaigns/new" },
    ],
  },
];

const linkClass = (current: boolean) =>
  cn(
    "flex h-9 items-center gap-2.5 rounded-[10px] px-2.5 text-sm transition-colors",
    current ? "bg-surface font-semibold text-ink shadow-xs" : "font-medium text-body hover:bg-hover hover:text-ink"
  );

const AdminTag: FC = () => (
  <span className="rounded-full bg-accent-100 px-2 py-[3px] text-[11px] font-bold leading-none text-accent-900">
    Admin
  </span>
);

const THEMES: { value: ThemePreference; label: string; Icon: LucideIcon }[] = [
  { value: "system", label: "Match my device", Icon: Monitor },
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
];

/** Theme: three icon buttons that fit the sidebar (their names are on hover and for screen readers). */
const ThemeSwitch: FC = () => {
  const { preference, setPreference } = useTheme();
  return (
    <div className="flex h-9 items-center gap-2.5 px-2.5">
      <span id="admin-theme" className="mr-auto text-sm font-medium text-body">
        Theme
      </span>
      <div role="radiogroup" aria-labelledby="admin-theme" className="flex rounded-[10px] bg-hover p-[3px]">
        {THEMES.map(({ value, label, Icon }) => {
          const on = preference === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={label}
              title={label}
              onClick={() => setPreference(value)}
              className={cn(
                "grid h-7 w-8 place-items-center rounded-[7px] transition-colors",
                on ? "bg-surface text-ink shadow-xs" : "text-subtle hover:text-ink"
              )}
            >
              <Icon size={15} strokeWidth={1.8} aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

/** Follow-ups waiting for a decision, shared with the Follow-ups page's cache. */
const FollowUpBadge: FC = () => {
  const { data } = useGetFollowUpsQuery({ status: "suggested" });
  const n = (data?.counts.suggested ?? 0) - (data?.counts.drafting ?? 0);
  if (n <= 0) return null;
  return (
    <span className="ml-auto rounded-full bg-ink px-1.5 py-[2px] font-mono text-[10.5px] font-semibold leading-none text-surface tabular-nums">
      {n > 99 ? "99+" : n}
      <span className="sr-only"> waiting</span>
    </span>
  );
};

const NavLinks: FC<{ pathname: string; onNavigate?: () => void }> = ({ pathname, onNavigate }) => (
  <>
    <AskButton className="mb-2 w-full" />
    <div className="-mx-1 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-1">
      {NAV.map((group, g) => (
        <div key={g} className="flex flex-col gap-0.5">
          {group.name && <p className="px-2.5 pb-1 pt-1 text-[12px] font-medium text-muted">{group.name}</p>}
          <ul className="flex flex-col gap-0.5">
            {group.items.map(({ href, label, icon: Icon, isCurrent, badge }) => {
              const current = isCurrent(pathname);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    aria-current={current ? "page" : undefined}
                    className={linkClass(current)}
                  >
                    <Icon
                      size={17}
                      strokeWidth={1.8}
                      aria-hidden="true"
                      className={current ? "text-accent" : "text-subtle"}
                    />
                    {label}
                    {badge === "followUps" && <FollowUpBadge />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
    <div className="mt-3 flex flex-col gap-0.5 border-t border-line pt-3">
      <Link href="/admin/team" onClick={onNavigate} aria-current={pathname === "/admin/team" ? "page" : undefined} className={linkClass(pathname === "/admin/team")}>
        <ShieldCheck size={17} strokeWidth={1.8} aria-hidden="true" className={pathname === "/admin/team" ? "text-accent" : "text-subtle"} />
        Admins
      </Link>
      <ThemeSwitch />
      <Link href="/new-document" onClick={onNavigate} className={cn(linkClass(false), "text-subtle")}>
        <ChevronLeft size={17} strokeWidth={1.8} aria-hidden="true" className="text-subtle" />
        Back to the app
      </Link>
    </div>
  </>
);

interface Props {
  /** The page's name, for the browser tab. */
  title: string;
  /** Pages with their own full-width chrome (the campaign steps) skip the sidebar. */
  bare?: boolean;
}

/** The admin shell: a sidebar on desktop, a top bar with a menu on phones, and the admin check. */
const AdminLayout: FC<PropsWithChildren<Props>> = ({ title, bare = false, children }) => {
  const { pathname } = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <>
      <AppHead>
        <title>{`${title} · Admin · AI Examiner`}</title>
      </AppHead>
      <style jsx global>
        {VIZ_CSS}
      </style>
      <AdminGate>
        <AskProvider>
        {bare ? (
          <div className="min-h-[100dvh] bg-canvas text-ink">{children}</div>
        ) : (
          <div className="min-h-[100dvh] bg-canvas text-ink md:flex">
            {/* Phones: top bar and a menu that opens below it. */}
            <div className="sticky top-0 z-30 border-b border-line bg-rail md:hidden">
              <div className="flex h-14 items-center gap-2.5 px-4">
                <AppMark size={15} />
                <AdminTag />
                <AskButton compact className="ml-auto w-10 justify-center px-0" />
                <button
                  type="button"
                  aria-expanded={menuOpen}
                  aria-controls={menuId}
                  onClick={() => setMenuOpen((open) => !open)}
                  className="inline-flex h-10 items-center gap-2 rounded-[10px] px-2.5 text-sm font-semibold text-ink transition-colors hover:bg-hover"
                >
                  {menuOpen ? (
                    <X size={18} strokeWidth={1.8} aria-hidden="true" />
                  ) : (
                    <Menu size={18} strokeWidth={1.8} aria-hidden="true" />
                  )}
                  Menu
                </button>
              </div>
              <nav
                id={menuId}
                aria-label="Admin"
                className={cn(
                  menuOpen ? "flex" : "hidden",
                  "flex-col gap-1 border-t border-line px-3 pb-3 pt-2"
                )}
              >
                <NavLinks pathname={pathname} onNavigate={() => setMenuOpen(false)} />
              </nav>
            </div>

            {/* Desktop sidebar: the rail runs the full height, the links stay in view. */}
            <div className="hidden w-[240px] shrink-0 border-r border-line bg-rail md:block">
              <nav aria-label="Admin" className="sticky top-0 flex h-screen flex-col px-3 py-4">
                <div className="flex items-center gap-2 px-2 pb-3.5 pt-1.5">
                  <AppMark size={15} />
                  <span className="ml-auto">
                    <AdminTag />
                  </span>
                </div>
                <NavLinks pathname={pathname} />
              </nav>
            </div>

            <main className="flex min-w-0 flex-1 flex-col gap-5 px-4 pb-12 pt-5 md:px-9 md:pb-10 md:pt-7">
              {children}
            </main>
          </div>
        )}
        </AskProvider>
      </AdminGate>
    </>
  );
};

export default AdminLayout;
