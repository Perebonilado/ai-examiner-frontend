import Link from "next/link";
import { useRouter } from "next/router";
import React, { FC, useEffect, useRef, useState } from "react";
import { Globe, Menu, X } from "lucide-react";
import cn from "classnames";
import { useModalContext } from "@/contexts/ModalContext";
import { useGoogleTranslationContext } from "@/contexts/GoogleTransalationContext";
import { useIsLoggedIn } from "@/hooks/useIsLoggedIn";
import GoogleTranslateLanguagePickerModal from "@/@shared/components/GoogleTranslateLanguagePickerModal";
import UserManagementBox from "@/@shared/components/UserManagementBox";
import AppMark from "@/@shared/components/AppLayout/AppMark";
import { siteFontClass, sitePalette } from "./siteTheme";

const links = [
  { title: "Home", href: "/" },
  { title: "Pricing", href: "/pricing" },
];

/** The site header: logo, centred links, language, and sign in / create account (or the account
 *  menu when signed in). Used on the home page and every page that uses WebLayout. */
const SiteHeader: FC = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useRouter();
  const { isLoggedIn } = useIsLoggedIn();
  const { setModalContent } = useModalContext();
  const { selectedLanguageCode } = useGoogleTranslationContext();
  const menuRef = useRef<HTMLElement>(null);

  const openLanguages = () => {
    setOpen(false);
    setModalContent(<GoogleTranslateLanguagePickerModal />);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const code = (selectedLanguageCode || "en").toUpperCase();

  return (
    <header ref={menuRef} style={sitePalette} className={cn(siteFontClass, "relative z-50 bg-white text-[var(--hk)]")}>
      <div className="flex h-14 items-center justify-between px-5">
        <AppMark size={14.7} className="!text-[var(--hk)]" />

        <nav aria-label="Main" className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 lg:flex">
          {links.map((l) => {
            const current = pathname === l.href;
            return (
              <Link
                key={l.title}
                href={l.href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "text-[14px] font-medium transition-colors",
                  current ? "text-[var(--hp)]" : "text-[#2f2f35] hover:text-[var(--hp)]"
                )}
              >
                {l.title}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <button
            type="button"
            onClick={openLanguages}
            aria-haspopup="dialog"
            aria-label={`Language: ${code}. Change language`}
            className="inline-flex h-10 items-center gap-1.5 text-[14px] font-medium text-[#2f2f35] transition-colors hover:text-[var(--hp)]"
          >
            <Globe size={16} strokeWidth={1.75} aria-hidden />
            {code}
          </button>
          {isLoggedIn ? (
            <UserManagementBox />
          ) : (
            <>
              <Link href="/auth/login" className="text-[14px] font-medium text-[#2f2f35] transition-colors hover:text-[var(--hp)]">
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex h-10 items-center rounded-full bg-[var(--hp)] px-4 text-[14px] font-medium text-white transition-colors hover:bg-[var(--hp-hover)]"
              >
                Create account
              </Link>
            </>
          )}
        </div>

        <div className="-mr-2 flex items-center gap-1 lg:hidden">
          {isLoggedIn && <UserManagementBox />}
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-xl text-[var(--hk)]"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="site-mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} strokeWidth={1.75} aria-hidden /> : <Menu size={22} strokeWidth={1.75} aria-hidden />}
          </button>
        </div>
      </div>

      {open && (
        <div
          id="site-mobile-menu"
          className="absolute inset-x-2 top-14 rounded-[20px] border border-[#ececef] bg-white p-2 shadow-[0_18px_40px_-18px_rgba(14,14,16,0.35)] lg:hidden"
        >
          {links.map((l) => {
            const current = pathname === l.href;
            return (
              <Link
                key={l.title}
                href={l.href}
                aria-current={current ? "page" : undefined}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex h-12 items-center rounded-xl px-4 text-[16px] font-medium",
                  current ? "text-[var(--hp)]" : "text-[var(--hk)] hover:bg-[#f3f3f5]"
                )}
              >
                {l.title}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={openLanguages}
            className="flex h-12 w-full items-center gap-2 rounded-xl px-4 text-left text-[16px] font-medium text-[var(--hk)] hover:bg-[#f3f3f5]"
          >
            <Globe size={18} strokeWidth={1.75} aria-hidden />
            Language · {code}
          </button>
          {!isLoggedIn && (
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-[#ececef] pt-3">
              <Link
                href="/auth/login"
                className="flex h-12 items-center justify-center rounded-full border border-[#d9d9de] text-[15px] font-medium text-[var(--hk)]"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="flex h-12 items-center justify-center rounded-full bg-[var(--hp)] text-[15px] font-medium text-white"
              >
                Create account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default SiteHeader;
