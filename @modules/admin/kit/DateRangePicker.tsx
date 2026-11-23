import React, { FC, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import cn from "classnames";
import { CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { DayRange } from "@/models/admin.model";
import { todayKey } from "../format";
import {
  FIRST_DAY,
  PRESETS,
  PresetKey,
  addDays,
  addMonths,
  clampRange,
  daysIn,
  formatRange,
  matchPreset,
  shiftRange,
} from "../range";
import { Popover, useNarrow } from "./Popover";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const monthName = (month: string) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", month: "long", year: "numeric" }).format(
    new Date(`${month}-01T12:00:00Z`)
  );
const longDay = (day: string) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${day}T12:00:00Z`));
const shortDay = (day: string) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", day: "numeric", month: "short", year: "numeric" }).format(
    new Date(`${day}T12:00:00Z`)
  );

/** The days shown for a month: Monday-first weeks, with blanks before the 1st. */
const monthGrid = (month: string): (string | null)[] => {
  const first = `${month}-01`;
  const lead = (new Date(`${first}T12:00:00Z`).getUTCDay() + 6) % 7;
  const days: (string | null)[] = Array(lead).fill(null);
  for (let d = first; d.slice(0, 7) === month; d = addDays(d, 1)) days.push(d);
  while (days.length % 7) days.push(null);
  return days;
};

interface CalendarProps {
  month: string;
  anchor: string | null;
  draft: DayRange | null;
  hover: string | null;
  today: string;
  focusDay: string;
  onPick: (day: string) => void;
  onHover: (day: string | null) => void;
  onFocusDay: (day: string) => void;
  /** Hides the heading's own arrows (the two-month view has one pair). */
  label: string;
}

const MonthCalendar: FC<CalendarProps> = ({
  month,
  anchor,
  draft,
  hover,
  today,
  focusDay,
  onPick,
  onHover,
  onFocusDay,
  label,
}) => {
  const days = monthGrid(month);
  // While choosing the second day, the band follows the pointer.
  const band: DayRange | null =
    anchor && hover ? (hover < anchor ? { from: hover, to: anchor } : { from: anchor, to: hover }) : draft;

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <p className="px-1 text-center text-sm font-bold text-ink" aria-hidden="true">
        {label}
      </p>
      <div role="grid" aria-label={label} className="grid grid-cols-7 gap-y-0.5" onMouseLeave={() => onHover(null)}>
        <div role="row" className="contents">
          {WEEKDAYS.map((w) => (
            <span
              key={w}
              role="columnheader"
              aria-label={w}
              className="grid h-7 place-items-center text-[11px] font-semibold text-muted"
            >
              {w}
            </span>
          ))}
        </div>
        {Array.from({ length: days.length / 7 }, (_, row) => (
          <div role="row" key={row} className="contents">
            {days.slice(row * 7, row * 7 + 7).map((day, i) => {
              if (!day) return <span key={`b${row}-${i}`} role="gridcell" aria-hidden="true" className="h-9" />;
              const disabled = day > today || day < FIRST_DAY;
              const inBand = !!band && day >= band.from && day <= band.to;
              const isStart = !!band && day === band.from;
              const isEnd = !!band && day === band.to;
              const edge = isStart || isEnd;
              const col = i;
              return (
                <div
                  key={day}
                  role="gridcell"
                  aria-selected={inBand}
                  className={cn("relative h-9", {
                    // The band: a flat strip behind the run of days, rounded at its ends and row edges.
                    "bg-accent-50": inBand && !(isStart && isEnd),
                    "rounded-l-[10px]": inBand && (isStart || col === 0),
                    "rounded-r-[10px]": inBand && (isEnd || col === 6),
                  })}
                >
                  <button
                    type="button"
                    tabIndex={day === focusDay ? 0 : -1}
                    data-day={day}
                    disabled={disabled}
                    aria-label={`${longDay(day)}${day === today ? ", today" : ""}`}
                    aria-pressed={edge}
                    onClick={() => onPick(day)}
                    onMouseEnter={() => !disabled && onHover(day)}
                    onFocus={() => onFocusDay(day)}
                    className={cn(
                      "relative mx-auto grid h-9 w-9 place-items-center rounded-[10px] text-[13px] tabular-nums transition-colors",
                      disabled
                        ? "cursor-default text-faint opacity-40"
                        : edge
                          ? "bg-ink font-bold text-surface"
                          : inBand
                            ? "font-semibold text-accent-900 hover:bg-accent-100"
                            : "text-body hover:bg-hover"
                    )}
                  >
                    {Number(day.slice(8))}
                    {day === today && !edge && (
                      <span aria-hidden="true" className="absolute bottom-1 h-1 w-1 rounded-full bg-accent" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

interface PanelProps {
  value: DayRange | null;
  presets: PresetKey[];
  anyTimeLabel?: string;
  onDone: (range: DayRange | null) => void;
  onCancel: () => void;
}

const PickerPanel: FC<PanelProps> = ({ value, presets, anyTimeLabel, onDone, onCancel }) => {
  const today = todayKey();
  const narrow = useNarrow();
  const [draft, setDraft] = useState<DayRange | null>(value);
  const [anchor, setAnchor] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  // The right-hand month (the only one on phones) starts at the range's end.
  const [lastMonth, setLastMonth] = useState((value?.to ?? today).slice(0, 7));
  const [focusDay, setFocusDay] = useState(value?.to ?? today);
  const gridRef = useRef<HTMLDivElement>(null);

  const months = narrow ? [lastMonth] : [addMonths(`${lastMonth}-01`, -1).slice(0, 7), lastMonth];
  const canBack = months[0] > FIRST_DAY.slice(0, 7);
  const canForward = lastMonth < today.slice(0, 7);
  const current = matchPreset(value ?? { from: "", to: "" }, today);
  const options = PRESETS.filter((p) => presets.includes(p.key));

  const pick = (day: string) => {
    if (!anchor) {
      setAnchor(day);
      setDraft({ from: day, to: day });
      return;
    }
    setDraft(day < anchor ? { from: day, to: anchor } : { from: anchor, to: day });
    setAnchor(null);
    setHover(null);
  };

  // Arrow keys move between days; Page Up / Down between months.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    let next: string | null = null;
    if (step[e.key] !== undefined) next = addDays(focusDay, step[e.key]);
    if (e.key === "PageUp") next = addMonths(focusDay, -1);
    if (e.key === "PageDown") next = addMonths(focusDay, 1);
    if (!next) return;
    e.preventDefault();
    if (next > today) next = today;
    if (next < FIRST_DAY) next = FIRST_DAY;
    setFocusDay(next);
    const m = next.slice(0, 7);
    if (!months.includes(m)) setLastMonth(next < `${months[0]}-01` ? (narrow ? m : addMonths(`${m}-01`, 1).slice(0, 7)) : m);
    if (anchor) setHover(next);
  };

  useEffect(() => {
    const el = gridRef.current?.querySelector<HTMLButtonElement>(`[data-day="${focusDay}"]`);
    if (el && gridRef.current?.contains(document.activeElement)) el.focus();
  }, [focusDay, lastMonth]);

  const ready = !!draft && !anchor;
  const summary = draft
    ? anchor
      ? `${shortDay(draft.from)} – pick the last day`
      : `${formatRange(draft)} · ${daysIn(draft)} ${daysIn(draft) === 1 ? "day" : "days"}`
    : "Pick the first day";

  return (
    <div className="flex flex-col sm:flex-row">
      <ul
        aria-label="Quick ranges"
        className="flex flex-wrap gap-1.5 border-b border-line p-3 sm:w-[184px] sm:flex-col sm:flex-nowrap sm:gap-0.5 sm:border-b-0 sm:border-r sm:p-2"
      >
        {anyTimeLabel && (
          <li>
            <PresetRow label={anyTimeLabel} on={!value} onClick={() => onDone(null)} />
          </li>
        )}
        {options.map((p) => (
          <li key={p.key}>
            <PresetRow label={p.label} on={current?.key === p.key} onClick={() => onDone(p.range(today))} />
          </li>
        ))}
      </ul>

      <div className="flex min-w-0 flex-col">
        <div className="relative px-4 pb-2 pt-3" ref={gridRef} onKeyDown={onKeyDown}>
          <div className="absolute inset-x-3 top-2.5 flex justify-between">
            <button
              type="button"
              aria-label="Earlier month"
              disabled={!canBack}
              onClick={() => setLastMonth(addMonths(`${lastMonth}-01`, -1).slice(0, 7))}
              className="grid h-8 w-8 place-items-center rounded-lg text-subtle transition-colors hover:bg-hover hover:text-ink disabled:opacity-30"
            >
              <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Later month"
              disabled={!canForward}
              onClick={() => setLastMonth(addMonths(`${lastMonth}-01`, 1).slice(0, 7))}
              className="grid h-8 w-8 place-items-center rounded-lg text-subtle transition-colors hover:bg-hover hover:text-ink disabled:opacity-30"
            >
              <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
          <div className={cn("grid gap-6", narrow ? "grid-cols-1" : "grid-cols-2")}>
            {months.map((m) => (
              <MonthCalendar
                key={m}
                month={m}
                label={monthName(m)}
                anchor={anchor}
                draft={draft}
                hover={hover}
                today={today}
                focusDay={months.includes(focusDay.slice(0, 7)) ? focusDay : `${m}-01`}
                onPick={pick}
                onHover={(d) => anchor && setHover(d)}
                onFocusDay={setFocusDay}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 border-t border-line px-4 py-3">
          <p aria-live="polite" className="mr-auto min-w-0 text-[13px] text-subtle tabular-nums">
            {summary}
          </p>
          <button
            type="button"
            onClick={onCancel}
            className="h-9 rounded-[10px] px-3.5 text-[13px] font-semibold text-body transition-colors hover:bg-hover"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!ready}
            onClick={() => draft && onDone(clampRange(draft, today))}
            className="h-9 rounded-[10px] bg-ink px-4 text-[13px] font-semibold text-surface transition-opacity disabled:opacity-40"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

const PresetRow: FC<{ label: string; on: boolean; onClick: () => void }> = ({ label, on, onClick }) => (
  <button
    type="button"
    aria-pressed={on}
    onClick={onClick}
    className={cn(
      "flex h-9 w-full items-center gap-2 whitespace-nowrap rounded-[9px] px-2.5 text-left text-[13px] transition-colors",
      "max-sm:h-8 max-sm:w-auto max-sm:rounded-full max-sm:border max-sm:px-3",
      on
        ? "font-bold text-ink max-sm:border-ink max-sm:bg-ink max-sm:text-surface sm:bg-hover"
        : "font-medium text-body hover:bg-hover max-sm:border-control"
    )}
  >
    <span className="flex-1">{label}</span>
    {on && <Check size={16} strokeWidth={2.6} aria-hidden="true" className="max-sm:hidden" />}
  </button>
);

interface Props {
  value: DayRange | null;
  onChange: (range: DayRange | null) => void;
  /** Which quick ranges to list. */
  presets?: PresetKey[];
  /** Adds an option meaning "no date filter" (value null), e.g. "Any time". */
  anyTimeLabel?: string;
  /** Shows ‹ › buttons that move the range by its own length. */
  stepper?: boolean;
  /** What the dates filter, for screen readers ("Date range", "Signed up"). */
  label: string;
  /** Shown before the value on the button ("Signed up"). */
  prefix?: string;
  className?: string;
}

/** Quick ranges as a list, and a two-month calendar for any other run of days. */
export const DateRangePicker: FC<Props> = ({
  value,
  onChange,
  presets = ["today", "yesterday", "7d", "30d", "90d", "this_month", "last_month", "this_year", "12m", "all"],
  anyTimeLabel,
  stepper = false,
  label,
  prefix,
  className,
}) => {
  const today = todayKey();
  const preset = value ? matchPreset(value, today) : undefined;
  const earlier = value ? shiftRange(value, -1, today) : null;
  const later = value ? shiftRange(value, 1, today) : null;
  const name = value ? (preset?.label ?? formatRange(value)) : (anyTimeLabel ?? "Any time");
  const dates = value && preset ? formatRange(value) : null;
  const [open, setOpen] = useState(false);
  const stepButton =
    "grid h-10 w-9 shrink-0 place-items-center border border-control bg-surface text-subtle transition-colors hover:bg-well hover:text-ink disabled:cursor-not-allowed disabled:opacity-40";

  const unit = useMemo(() => (value ? (daysIn(value) === 1 ? "day" : "period") : "period"), [value]);

  return (
    <div className={cn("flex min-w-0 items-stretch", className)}>
      {stepper && (
        <button
          type="button"
          aria-label={`Previous ${unit}`}
          disabled={!earlier}
          onClick={() => earlier && onChange(earlier)}
          className={cn(stepButton, "rounded-l-[10px] border-r-0")}
        >
          <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
        </button>
      )}
      <Popover
        label={`${label}: choose dates`}
        sheetOnPhones
        open={open}
        onOpenChange={setOpen}
        initialFocus={-1}
        trigger={({ ref, props, open }) => (
          <button
            ref={ref}
            type="button"
            {...props}
            aria-label={`${label}: ${name}${dates ? `, ${dates}` : ""}`}
            className={cn(
              "flex h-10 min-w-0 items-center gap-2 border border-control bg-surface px-3 text-left text-[13px] transition-colors hover:bg-well",
              stepper ? "" : "rounded-[10px]",
              open && "border-ink"
            )}
          >
            <CalendarDays size={16} strokeWidth={1.8} aria-hidden="true" className="shrink-0 text-subtle" />
            {prefix && <span className="shrink-0 font-medium text-subtle">{prefix}</span>}
            <span className="truncate font-bold text-ink">{name}</span>
            {dates && <span className="hidden truncate text-muted tabular-nums md:inline">{dates}</span>}
            <ChevronDown size={15} strokeWidth={2} aria-hidden="true" className="ml-auto shrink-0 text-muted" />
          </button>
        )}
      >
        {(close) => (
          <PickerPanel
            value={value}
            presets={presets}
            anyTimeLabel={anyTimeLabel}
            onCancel={close}
            onDone={(r) => {
              onChange(r);
              close();
            }}
          />
        )}
      </Popover>
      {stepper && (
        <button
          type="button"
          aria-label={`Next ${unit}`}
          disabled={!later}
          onClick={() => later && onChange(later)}
          className={cn(stepButton, "rounded-r-[10px] border-l-0")}
        >
          <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
        </button>
      )}
    </div>
  );
};
