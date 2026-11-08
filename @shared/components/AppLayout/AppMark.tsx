import Link from "next/link";
import React, { FC } from "react";
import cn from "classnames";
import { useIsLoggedIn } from "@/hooks/useIsLoggedIn";

interface Props {
  /** Hide the "Examiner" word (collapsed sidebar). */
  markOnly?: boolean;
  className?: string;
  onClick?: () => void;
}

/** AI Examiner logo for light surfaces: aubergine "AI" mark + wordmark. */
const AppMark: FC<Props> = ({ markOnly = false, className, onClick }) => {
  const { isLoggedIn } = useIsLoggedIn();

  return (
    <Link
      href={isLoggedIn ? "/new-document" : "/"}
      aria-label="AI Examiner home"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-[9px] whitespace-nowrap text-base font-bold tracking-[-0.02em] text-ink",
        className
      )}
    >
      <span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-[9px] bg-brand text-[13px] font-extrabold tracking-[-0.03em] text-white shadow-[inset_0_-2px_0_rgba(0,0,0,0.18)]">
        <span className="translate-y-[0.5px]">AI</span>
      </span>
      {!markOnly && <span>Examiner</span>}
    </Link>
  );
};

export default AppMark;
