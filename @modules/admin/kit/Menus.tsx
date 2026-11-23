import React, { KeyboardEvent, ReactNode, useMemo, useRef, useState } from "react";
import cn from "classnames";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { formatNumber } from "../format";
import { Popover } from "./Popover";

export interface MenuOption<T extends string> {
  value: T;
  label: string;
  /** A second line under the label. */
  description?: string;
  /** Shown on the right (how many match). */
  count?: number;
  /** A colour key (CSS colour) before the label. */
  swatch?: string;
}

/** The button that opens a filter menu: "Plan · Paid", with the value in bold when set. */
const triggerClass = (active: boolean, open: boolean) =>
  cn(
    "flex h-10 max-w-full items-center gap-1.5 rounded-[10px] border bg-surface px-3 text-[13px] transition-colors hover:bg-well",
    open ? "border-ink" : active ? "border-control-strong" : "border-control"
  );

/** Up/Down move between options, Home/End jump; Enter and Space press the focused one. */
const moveFocus = (e: KeyboardEvent<HTMLElement>) => {
  const keys = ["ArrowDown", "ArrowUp", "Home", "End"];
  if (!keys.includes(e.key)) return;
  const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>("[data-option]"));
  if (!items.length) return;
  e.preventDefault();
  const at = items.indexOf(document.activeElement as HTMLElement);
  const next =
    e.key === "Home"
      ? 0
      : e.key === "End"
        ? items.length - 1
        : e.key === "ArrowDown"
          ? Math.min(items.length - 1, at + 1)
          : Math.max(0, at - 1);
  items[next]?.focus();
};

const Box = ({ on }: { on: boolean }) => (
  <span
    aria-hidden="true"
    className={cn(
      "grid h-4 w-4 shrink-0 place-items-center rounded-[5px] border transition-colors",
      on ? "border-ink bg-ink text-surface" : "border-control-strong bg-surface"
    )}
  >
    {on && <Check size={11} strokeWidth={3.2} />}
  </span>
);

const Swatch = ({ color }: { color?: string }) =>
  color ? <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: color }} /> : null;

/** One choice from a short list, e.g. Segment or Plan. */
export function SelectMenu<T extends string>({
  label,
  value,
  options,
  onChange,
  placeholder,
  align = "start",
  icon,
  className,
}: {
  label: string;
  value: T;
  options: MenuOption<T>[];
  onChange: (value: T) => void;
  /** Shown when `value` is the first option (the "everything" choice): the label alone. */
  placeholder?: boolean;
  align?: "start" | "end";
  icon?: ReactNode;
  className?: string;
}) {
  const current = options.find((o) => o.value === value) ?? options[0];
  const isDefault = placeholder && current.value === options[0].value;
  return (
    <Popover
      label={label}
      role="listbox"
      placement={align === "end" ? "bottom-end" : "bottom-start"}
      className="min-w-[220px] p-1.5"
      trigger={({ ref, props, open }) => (
        <button
          ref={ref}
          type="button"
          {...props}
          aria-label={`${label}: ${current.label}`}
          className={cn(triggerClass(!isDefault, open), className)}
        >
          {icon}
          <span className={cn("shrink-0", isDefault ? "font-semibold text-body" : "font-medium text-subtle")}>
            {label}
          </span>
          {!isDefault && <span className="truncate font-bold text-ink">{current.label}</span>}
          <ChevronDown size={15} strokeWidth={2} aria-hidden="true" className="ml-0.5 shrink-0 text-muted" />
        </button>
      )}
    >
      {(close) => (
        <div role="presentation" onKeyDown={moveFocus} className="flex flex-col gap-0.5">
          {options.map((o) => {
            const on = o.value === value;
            return (
              <button
                key={o.value || "all"}
                type="button"
                role="option"
                aria-selected={on}
                data-option
                onClick={() => {
                  onChange(o.value);
                  close();
                }}
                className={cn(
                  "flex w-full items-start gap-2.5 rounded-[9px] px-2.5 py-2 text-left text-[13px] transition-colors hover:bg-hover focus-visible:bg-hover focus-visible:outline-none",
                  on && "bg-hover"
                )}
              >
                <Swatch color={o.swatch} />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className={cn("text-ink", on ? "font-bold" : "font-medium")}>{o.label}</span>
                  {o.description && <span className="text-[12px] leading-snug text-muted">{o.description}</span>}
                </span>
                {o.count !== undefined && (
                  <span className="shrink-0 pt-px text-[12px] font-medium text-muted tabular-nums">
                    {formatNumber(o.count)}
                  </span>
                )}
                <span className="grid h-[18px] w-4 shrink-0 place-items-center">
                  {on && <Check size={16} strokeWidth={2.6} aria-hidden="true" className="text-ink" />}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </Popover>
  );
}

/** Any number of choices, with counts, "only this" and a search when the list is long. */
export function MultiSelectMenu<T extends string>({
  label,
  allLabel = "All",
  value,
  options,
  onChange,
  className,
}: {
  label: string;
  allLabel?: string;
  value: T[];
  options: MenuOption<T>[];
  onChange: (value: T[]) => void;
  className?: string;
}) {
  const [query, setQuery] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const shown = useMemo(
    () => options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase())),
    [options, query]
  );
  const picked = options.filter((o) => value.includes(o.value));
  const summary =
    picked.length === 0
      ? null
      : picked.length === 1
        ? picked[0].label
        : picked.length === 2
          ? `${picked[0].label}, ${picked[1].label}`
          : `${picked[0].label} +${picked.length - 1}`;

  const toggle = (v: T) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);

  return (
    <Popover
      label={label}
      role="listbox"
      className="w-[300px] p-1.5"
      onOpenChange={(open) => !open && setQuery("")}
      trigger={({ ref, props, open }) => (
        <button
          ref={ref}
          type="button"
          {...props}
          aria-label={`${label}: ${summary ?? allLabel}`}
          className={cn(triggerClass(!!summary, open), className)}
        >
          <span className={cn("shrink-0", summary ? "font-medium text-subtle" : "font-semibold text-body")}>
            {label}
          </span>
          {summary && <span className="truncate font-bold text-ink">{summary}</span>}
          {picked.length > 0 && (
            <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-ink px-1.5 text-[11px] font-bold text-surface tabular-nums">
              {picked.length}
            </span>
          )}
          <ChevronDown size={15} strokeWidth={2} aria-hidden="true" className="ml-0.5 shrink-0 text-muted" />
        </button>
      )}
    >
      {() => (
        <div className="flex flex-col">
          {options.length > 7 && (
            <div className="mb-1 flex h-9 items-center gap-2 rounded-[9px] border border-control px-2.5 text-muted focus-within:border-ink">
              <Search size={14} strokeWidth={2} aria-hidden="true" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Find a ${label.toLowerCase()}`}
                aria-label={`Find a ${label.toLowerCase()}`}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    listRef.current?.querySelector<HTMLElement>("[data-option]")?.focus();
                  }
                }}
                className="h-full min-w-0 flex-1 bg-transparent text-[16px] text-ink placeholder:text-faint focus:outline-none sm:text-[13px]"
              />
            </div>
          )}
          <div className="flex items-center justify-between px-2.5 py-1.5 text-[12px]">
            <span className="font-medium text-muted">
              {value.length ? `${value.length} of ${options.length} picked` : `${allLabel} shown`}
            </span>
            {value.length > 0 && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="inline-flex items-center gap-1 font-semibold text-accent hover:text-accent-900"
              >
                <X size={12} strokeWidth={2.4} aria-hidden="true" />
                Clear
              </button>
            )}
          </div>
          <div
            ref={listRef}
            role="presentation"
            onKeyDown={moveFocus}
            className="flex flex-col gap-0.5"
          >
            {shown.length === 0 && <p className="px-2.5 py-3 text-[13px] text-muted">Nothing matches.</p>}
            {shown.map((o) => {
              const on = value.includes(o.value);
              return (
                <div key={o.value} className="group relative flex items-center">
                  <button
                    type="button"
                    role="option"
                    aria-selected={on}
                    data-option
                    onClick={() => toggle(o.value)}
                    className="flex h-9 w-full items-center gap-2.5 rounded-[9px] px-2.5 text-left text-[13px] transition-colors hover:bg-hover focus-visible:bg-hover focus-visible:outline-none"
                  >
                    <Box on={on} />
                    <Swatch color={o.swatch} />
                    <span className={cn("min-w-0 flex-1 truncate text-ink", on ? "font-bold" : "font-medium")}>
                      {o.label}
                    </span>
                    {o.count !== undefined && (
                      <span className="shrink-0 text-[12px] font-medium text-muted tabular-nums group-hover:opacity-0 group-focus-within:opacity-0">
                        {formatNumber(o.count)}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange([o.value])}
                    className="absolute right-1.5 hidden h-7 rounded-[7px] px-2 text-[12px] font-semibold text-accent hover:bg-surface hover:text-accent-900 group-hover:block group-focus-within:block"
                  >
                    Only<span className="sr-only"> {o.label}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Popover>
  );
}

/** A few mutually exclusive choices side by side (Day / Week / Month). */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  size = "sm",
}: {
  label: string;
  value: T;
  options: { value: T; label: string; disabled?: boolean }[];
  onChange: (value: T) => void;
  size?: "sm" | "md";
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex shrink-0 rounded-[10px] bg-hover p-0.5">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            disabled={o.disabled}
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded-[8px] px-3 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40",
              size === "sm" ? "h-7 text-[12px]" : "h-9 text-[13px]",
              on ? "bg-surface text-ink shadow-xs" : "text-subtle hover:text-ink"
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Active filters as removable tokens, with "Clear all". */
export const FilterTokens = ({
  tokens,
  onClearAll,
}: {
  tokens: { key: string; label: ReactNode; onRemove: () => void }[];
  onClearAll: () => void;
}) =>
  tokens.length ? (
    <div className="flex flex-wrap items-center gap-1.5" aria-label="Filters in use">
      {tokens.map((t) => (
        <span
          key={t.key}
          className="inline-flex h-7 max-w-full items-center gap-1 rounded-full border border-line bg-surface pl-2.5 pr-1 text-[12px] text-body"
        >
          <span className="truncate">{t.label}</span>
          <button
            type="button"
            onClick={t.onRemove}
            aria-label="Remove this filter"
            className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-hover hover:text-ink"
          >
            <X size={12} strokeWidth={2.4} aria-hidden="true" />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="h-7 rounded-full px-2.5 text-[12px] font-semibold text-accent hover:text-accent-900"
      >
        Clear all
      </button>
    </div>
  ) : null;
