import Link from "next/link";
import React, { FC } from "react";
import cn from "classnames";
import { useIsLoggedIn } from "@/hooks/useIsLoggedIn";
import { lexend } from "@/@shared/components/site/fonts";

interface Props {
  /** Hide the "Examiner" word (collapsed sidebar). */
  markOnly?: boolean;
  /** Size of the "Examiner" word in px; the purple square scales with it. */
  size?: number;
  /** "ink" follows the theme's text colour; "white" is for dark surfaces such as the site footer. */
  tone?: "ink" | "white";
  className?: string;
  onClick?: () => void;
}

/**
 * The AI Examiner logo, used everywhere: a purple "AI" square and the "Examiner" wordmark in Lexend.
 * Every part is sized in em, so the logo keeps the same proportions at any size.
 */
const AppMark: FC<Props> = ({ markOnly = false, size = 16, tone = "ink", className, onClick }) => {
  const { isLoggedIn } = useIsLoggedIn();

  return (
    <Link
      href={isLoggedIn ? "/new-document" : "/"}
      aria-label="AI Examiner home"
      onClick={onClick}
      style={{ fontSize: size }}
      className={cn(
        lexend.className,
        "inline-flex items-center gap-[0.54em] whitespace-nowrap font-semibold leading-none tracking-[-0.01em]",
        tone === "white" ? "text-white" : "text-ink",
        className
      )}
    >
      <span
        aria-hidden="true"
        className="grid h-[1.5em] w-[1.5em] shrink-0 place-items-center rounded-[0.41em] bg-[#5b2ad6]"
      >
        <span className="text-[0.68em] font-bold tracking-normal text-white">AI</span>
      </span>
      {!markOnly && <span aria-hidden="true">Examiner</span>}
    </Link>
  );
};

export default AppMark;
