import React, { FC } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useGetUserProfileQuery } from "@/api-services/user.service";
import { useIsLoggedIn } from "@/hooks/useIsLoggedIn";
import { useModalContext } from "@/contexts/ModalContext";
import UpgradeAccountForm from "../UpgradeAccountForm";
import Button from "@/@shared/ui/Button";
import LanguageChangeBar from "./LanguageChangeBar";

export interface Crumb {
  label: string;
  href?: string;
}

interface Props {
  crumbs: Crumb[];
  handleBack?: () => void;
}

/** Desktop top bar: back, breadcrumbs, and (right) upgrade for guests + language. */
const TopNav: FC<Props> = ({ crumbs, handleBack }) => {
  const { isLoggedIn } = useIsLoggedIn();
  const { data } = useGetUserProfileQuery("", { skip: !isLoggedIn });
  const { setModalContent } = useModalContext();
  const isGuest = data?.role?.toLowerCase() === "guest";

  return (
    <header className="sticky top-0 z-30 flex h-[60px] shrink-0 items-center gap-3 border-b border-line bg-white/[0.86] px-7 backdrop-blur-[10px] backdrop-saturate-[1.4] max-md:hidden">
      {handleBack && (
        <button
          type="button"
          aria-label="Back"
          title="Back"
          onClick={handleBack}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-control bg-surface text-subtle transition-colors hover:bg-hover hover:text-ink"
        >
          <ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" />
        </button>
      )}

      {crumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm text-subtle">
          {crumbs.map((c, i) => {
            const last = i === crumbs.length - 1;
            if (last)
              return (
                <span key={i} aria-current="page" className="truncate font-semibold text-ink">
                  {c.label}
                </span>
              );
            return (
              <React.Fragment key={i}>
                {c.href ? (
                  <Link href={c.href} className="max-w-[260px] shrink-0 truncate transition-colors hover:text-ink">
                    {c.label}
                  </Link>
                ) : (
                  <span className="max-w-[260px] shrink-0 truncate">{c.label}</span>
                )}
                <ChevronRight size={14} strokeWidth={1.75} aria-hidden="true" className="shrink-0 text-[#c4c3cb]" />
              </React.Fragment>
            );
          })}
        </nav>
      )}

      <div className="ml-auto flex shrink-0 items-center gap-2">
        {isGuest && (
          <Button
            title="Upgrade account"
            variant="outlined"
            size="small"
            onClick={() => setModalContent(<UpgradeAccountForm />)}
          />
        )}
        <LanguageChangeBar />
      </div>
    </header>
  );
};

export default TopNav;
