import React, { FC, useId } from "react";
import cn from "classnames";
import { Monitor, Moon, Sun, LucideIcon } from "lucide-react";
import { ThemePreference, useTheme } from "@/contexts/ThemeContext";

const OPTIONS: { value: ThemePreference; label: string; Icon: LucideIcon }[] = [
  { value: "system", label: "System", Icon: Monitor },
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
];

interface Props {
  /** Small: icon + label in the account menu. Large: the Settings page. */
  size?: "small" | "large";
  className?: string;
}

/**
 * System / Light / Dark, as a radio group (arrow keys move between options). "System" follows
 * the device's setting.
 */
const ThemeSwitcher: FC<Props> = ({ size = "large", className }) => {
  const { preference, setPreference } = useTheme();
  const name = useId();
  const small = size === "small";

  return (
    <div
      role="radiogroup"
      aria-label="Appearance"
      className={cn(
        "grid grid-cols-3 gap-1 rounded-[10px] bg-sunken p-1",
        small ? "w-full" : "w-full max-w-[420px]",
        className
      )}
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const checked = preference === value;
        return (
          <label
            key={value}
            className={cn(
              "relative flex cursor-pointer items-center justify-center gap-1.5 rounded-[7px] font-semibold transition-colors",
              "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-1 has-[:focus-visible]:outline-accent-bright",
              small ? "h-8 text-[12.5px]" : "h-10 text-sm",
              checked
                ? "bg-surface text-ink shadow-xs ring-1 ring-control-strong"
                : "text-subtle hover:text-ink"
            )}
          >
            <input
              type="radio"
              name={name}
              value={value}
              checked={checked}
              onChange={() => setPreference(value)}
              className="sr-only"
            />
            <Icon size={small ? 14 : 16} strokeWidth={1.75} aria-hidden="true" />
            {label}
          </label>
        );
      })}
    </div>
  );
};

export default ThemeSwitcher;
