import React, { FC, PropsWithChildren, ReactNode, useId } from "react";
import Link from "next/link";
import cn from "classnames";
import { Search } from "lucide-react";
import Spinner from "@/@shared/components/Spinner";
import { ActivityType } from "@/models/admin.model";
import { ACTIVITY_TYPES, TONES, Tone, avatarTone } from "./activityTypes";
import { Delta } from "./format";

/* ---------- Surfaces ---------- */

export const Card: FC<
  PropsWithChildren<{ className?: string; as?: "section" | "div"; labelledBy?: string; label?: string }>
> = ({ children, className, as: As = "section", labelledBy, label }) => (
  <As
    aria-labelledby={labelledBy}
    aria-label={label}
    className={cn("min-w-0 rounded-2xl border border-line bg-surface", className)}
  >
    {children}
  </As>
);

export const PageHeader: FC<{ title: string; subtitle?: ReactNode; actions?: ReactNode }> = ({
  title,
  subtitle,
  actions,
}) => (
  <header className="flex flex-wrap items-end gap-x-5 gap-y-3">
    <div className="mr-auto flex min-w-0 flex-col gap-1">
      <h1 className="text-[26px] font-bold leading-tight tracking-[-0.02em] text-ink">{title}</h1>
      {subtitle ? <p className="text-sm text-subtle">{subtitle}</p> : null}
    </div>
    {actions}
  </header>
);

export const Breadcrumb: FC<{ parent: { label: string; href: string }; current: string }> = ({
  parent,
  current,
}) => (
  <nav aria-label="Breadcrumb">
    <ol className="flex min-w-0 items-center gap-2 text-[13px] text-muted">
      <li>
        <Link href={parent.href} className="font-semibold text-accent hover:text-accent-900">
          {parent.label}
        </Link>
      </li>
      <li aria-hidden="true">/</li>
      <li aria-current="page" className="min-w-0 truncate text-body">
        {current}
      </li>
    </ol>
  </nav>
);

/* ---------- Chips and avatars ---------- */

export const Chip: FC<PropsWithChildren<{ tone: Tone; className?: string; size?: "sm" | "md" }>> = ({
  tone,
  children,
  className,
  size = "sm",
}) => (
  <span
    className={cn(
      "inline-flex shrink-0 items-center whitespace-nowrap font-bold",
      size === "sm" ? "h-[22px] rounded-[7px] px-2 text-[11.5px]" : "rounded-full px-2.5 py-[3px] text-[12.5px]",
      TONES[tone],
      className
    )}
  >
    {children}
  </span>
);

export const TypeChip: FC<{ type: ActivityType; className?: string }> = ({ type, className }) => {
  const meta = ACTIVITY_TYPES[type] ?? { chip: type, tone: "grey" as Tone };
  return (
    <Chip tone={meta.tone} className={className}>
      {meta.chip}
    </Chip>
  );
};

export const Avatar: FC<{
  initials: string;
  seed: string;
  size?: number;
  online?: boolean;
  className?: string;
}> = ({ initials, seed, size = 36, online = false, className }) => (
  <span
    aria-hidden="true"
    style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
    className={cn(
      "relative grid shrink-0 place-items-center rounded-full font-bold",
      avatarTone(seed),
      className
    )}
  >
    {initials}
    {online && (
      <span
        className="absolute -bottom-px -right-px rounded-full border-2 border-surface bg-success"
        style={{ width: Math.max(10, size * 0.22), height: Math.max(10, size * 0.22) }}
      />
    )}
  </span>
);

export const DeltaNote: FC<{ delta: Delta }> = ({ delta }) => (
  <p
    className={cn("text-[13px] font-medium", {
      "text-success": delta.direction === "up",
      "text-danger": delta.direction === "down",
      "text-subtle": delta.direction === "same",
    })}
  >
    {delta.direction !== "same" && (
      <>
        <span aria-hidden="true">{delta.direction === "up" ? "▲ " : "▼ "}</span>
        <span className="sr-only">{delta.direction === "up" ? "Up " : "Down "}</span>
      </>
    )}
    {delta.text}
  </p>
);

/* ---------- Controls ---------- */

export const buttonClass = {
  primary:
    "inline-flex h-[42px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[10px] bg-brand px-[18px] text-sm font-semibold text-white shadow-xs transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50",
  secondary:
    "inline-flex h-[42px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[10px] border border-control bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:border-control-strong hover:bg-well disabled:cursor-not-allowed disabled:opacity-50",
  small:
    "inline-flex h-9 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[10px] border border-control bg-surface px-3.5 text-[13px] font-semibold text-ink transition-colors hover:border-control-strong hover:bg-well disabled:cursor-not-allowed disabled:border-line disabled:text-faint",
  danger:
    "inline-flex h-[42px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[10px] border border-danger-line bg-danger-bg px-4 text-sm font-semibold text-danger-strong transition-colors hover:border-danger disabled:cursor-not-allowed disabled:opacity-50",
  link: "font-semibold text-accent underline-offset-2 hover:text-accent-900 hover:underline",
};

export const inputClass =
  "h-[42px] w-full min-w-0 rounded-[10px] border border-control bg-surface px-3 text-[16px] text-ink placeholder:text-faint transition-colors hover:border-control-strong focus:border-accent-bright focus:outline-none focus:ring-2 focus:ring-accent-200 md:text-sm";

export const SearchField: FC<{
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}> = ({ label, placeholder, value, onChange, className }) => {
  const id = useId();
  return (
    <div
      className={cn(
        "flex h-[42px] items-center gap-2 rounded-[10px] border border-control bg-surface px-3.5 text-muted transition-colors focus-within:border-accent-bright focus-within:ring-2 focus-within:ring-accent-200",
        className
      )}
    >
      <Search size={16} strokeWidth={1.8} aria-hidden="true" />
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-full min-w-0 flex-1 bg-transparent text-[16px] text-ink placeholder:text-faint focus:outline-none md:text-sm"
      />
    </div>
  );
};

/** A row of toggle chips where one is on (aria-pressed). */
export function FilterChips<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const on = option.value === value;
        return (
          <button
            key={option.value || "all"}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(option.value)}
            className={cn(
              "h-9 rounded-full border px-3.5 text-[13px] font-semibold transition-colors",
              on
                ? "border-ink bg-ink text-surface"
                : "border-control bg-surface text-body hover:border-control-strong hover:bg-well"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- States ---------- */

export const LoadingBlock: FC<{ label?: string; className?: string }> = ({ label = "Loading", className }) => (
  <div className={cn("grid place-items-center py-16", className)}>
    <Spinner size="md" label={label} />
  </div>
);

export const EmptyState: FC<PropsWithChildren<{ title: string; className?: string }>> = ({
  title,
  children,
  className,
}) => (
  <div className={cn("flex flex-col items-center gap-2 px-6 py-14 text-center", className)}>
    <p className="text-[15px] font-semibold text-ink">{title}</p>
    {children ? <div className="max-w-[420px] text-sm text-subtle">{children}</div> : null}
  </div>
);

export const ErrorState: FC<{ title?: string; onRetry?: () => void; className?: string }> = ({
  title = "We couldn't load this.",
  onRetry,
  className,
}) => (
  <div role="alert" className={cn("flex flex-col items-center gap-3 px-6 py-14 text-center", className)}>
    <p className="text-[15px] font-semibold text-ink">{title}</p>
    <p className="text-sm text-subtle">Check your connection and try again.</p>
    {onRetry && (
      <button type="button" onClick={onRetry} className={buttonClass.small}>
        Try again
      </button>
    )}
  </div>
);

/** A thin progress bar (decorative: the numbers beside it say the same). */
export const ProgressBar: FC<{ pct: number; className?: string; barClassName?: string; height?: number }> = ({
  pct,
  className,
  barClassName = "bg-accent-bright",
  height = 6,
}) => (
  <span aria-hidden="true" className={cn("block overflow-hidden rounded-full bg-hover", className)} style={{ height }}>
    <span
      className={cn("block rounded-full", barClassName)}
      style={{ width: `${Math.max(0, Math.min(100, pct))}%`, height }}
    />
  </span>
);

/**
 * Table header cell with the shared look. Admin tables carry `!table`: globals.css hides every
 * <table> (a Google Translate toolbar workaround), so they must override it.
 */
export const Th: FC<PropsWithChildren<{ className?: string; align?: "left" | "right" }>> = ({
  children,
  className,
  align = "left",
}) => (
  <th
    scope="col"
    className={cn(
      "border-b border-line px-3 py-3.5 text-[12.5px] font-semibold text-subtle first:pl-5 last:pr-5",
      align === "right" ? "text-right" : "text-left",
      className
    )}
  >
    {children}
  </th>
);

export const Td: FC<PropsWithChildren<{ className?: string; align?: "left" | "right" }>> = ({
  children,
  className,
  align = "left",
}) => (
  <td
    className={cn(
      "border-b border-hover px-3 py-3 align-middle first:pl-5 last:pr-5 group-last:border-b-0",
      align === "right" ? "text-right tabular-nums" : "text-left",
      className
    )}
  >
    {children}
  </td>
);
