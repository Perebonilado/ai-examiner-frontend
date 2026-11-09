import React, { FC, useEffect, useState } from "react";
import cn from "classnames";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface Props {
  /** bordered: desktop top bar (matches the language button). ghost: phone bar, Easy Read header. */
  variant?: "bordered" | "ghost";
  className?: string;
}

/**
 * One-click light / dark switch for the navbars. Shows what a click turns on (a moon in light
 * mode, a sun in dark). "System" stays in the account menu and on the Settings page.
 */
const ThemeToggleButton: FC<Props> = ({ variant = "bordered", className }) => {
  const { resolved, setPreference } = useTheme();
  // The theme is only known in the browser: draw the icon after mounting (no server mismatch).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const dark = resolved === "dark";
  const label = dark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => setPreference(dark ? "light" : "dark")}
      className={cn(
        "grid shrink-0 place-items-center rounded-lg text-subtle transition-colors hover:text-ink",
        variant === "bordered"
          ? "h-[34px] w-[34px] border border-control bg-surface hover:bg-well"
          : "h-10 w-10 hover:bg-hover md:h-9 md:w-9",
        className
      )}
    >
      {mounted &&
        (dark ? (
          <Sun size={17} strokeWidth={1.75} aria-hidden="true" />
        ) : (
          <Moon size={16} strokeWidth={1.75} aria-hidden="true" />
        ))}
    </button>
  );
};

export default ThemeToggleButton;
