import React, { FC, ReactNode, useState } from "react";
import Link from "next/link";
import cn from "classnames";
import { formatNumber } from "../format";
import { ChartTooltip, SEQ_STEPS, SrTable, seqColor, useSize } from "./base";

/* ---------- Change badge ---------- */

/** "▲ 12%" / "▼ 54%" against the previous period; words for screen readers. */
export const ChangeBadge: FC<{ current: number; previous: number; className?: string; invert?: boolean }> = ({
  current,
  previous,
  className,
  invert = false,
}) => {
  if (!previous && !current) return <span className={cn("text-[12px] font-semibold text-muted", className)}>No change</span>;
  if (!previous) return <span className={cn("text-[12px] font-semibold text-muted", className)}>New</span>;
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return <span className={cn("text-[12px] font-semibold text-muted", className)}>No change</span>;
  const up = pct > 0;
  const good = invert ? !up : up;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-[6px] px-1.5 py-px text-[12px] font-bold tabular-nums",
        good ? "bg-success-bg text-success-strong" : "bg-danger-bg text-danger-strong",
        className
      )}
    >
      <span aria-hidden="true">{up ? "▲" : "▼"}</span>
      <span className="sr-only">{up ? "Up" : "Down"}</span>
      {Math.abs(pct) > 999 ? ">999" : Math.abs(pct)}%
    </span>
  );
};

/* ---------- Funnel ---------- */

export const Funnel: FC<{ steps: { key: string; label: string; count: number }[] }> = ({ steps }) => {
  const first = steps[0]?.count ?? 0;
  return (
    <ol className="flex flex-col">
      {steps.map((s, i) => {
        const ofFirst = first ? (s.count / first) * 100 : 0;
        const prev = i ? steps[i - 1].count : 0;
        const ofPrev = prev ? (s.count / prev) * 100 : 0;
        return (
          <li key={s.key} className="flex flex-col gap-1.5 py-2">
            <div className="flex items-baseline gap-2 text-[13px]">
              <span className="font-semibold text-ink">{s.label}</span>
              {i > 0 && (
                <span className="text-[12px] text-muted tabular-nums">
                  {prev ? `${pct(ofPrev)} of the step before` : ""}
                </span>
              )}
              <b className="ml-auto font-bold text-ink tabular-nums">{formatNumber(s.count)}</b>
              <span className="w-12 text-right text-[12px] font-semibold text-subtle tabular-nums">
                {i === 0 ? "100%" : pct(ofFirst)}
              </span>
            </div>
            <div aria-hidden="true" className="h-2.5 overflow-hidden rounded-[4px] bg-hover">
              <div
                className="h-full rounded-[4px]"
                style={{ width: `${s.count ? Math.max(0.8, ofFirst) : 0}%`, background: "var(--viz-primary)", opacity: 1 - i * 0.12 }}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
};

/** "22%", "3.4%", "0.3%", "<0.1%". */
export const pct = (v: number) => {
  if (v === 0) return "0%";
  if (v < 0.1) return "<0.1%";
  if (v < 10) return `${Math.round(v * 10) / 10}%`;
  return `${Math.round(v)}%`;
};

/* ---------- Bar list ---------- */

export const BarList: FC<{
  rows: { key: string; label: ReactNode; value: number; previous?: number; href?: string; color?: string }[];
  format?: (v: number) => string;
  compare?: boolean;
}> = ({ rows, format = formatNumber, compare = false }) => {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="flex flex-col gap-1">
      {rows.map((r) => {
        const inner = (
          <>
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-0 rounded-[8px]"
              style={{
                width: `${r.value ? Math.max(1.5, (r.value / max) * 100) : 0}%`,
                background: r.color ?? "var(--viz-bar)",
              }}
            />
            <span className="relative min-w-0 flex-1 truncate text-[13px] font-medium text-ink">{r.label}</span>
            {compare && r.previous !== undefined && <ChangeBadge current={r.value} previous={r.previous} className="relative" />}
            <b className="relative w-14 shrink-0 text-right text-[13px] font-bold text-ink tabular-nums">{format(r.value)}</b>
          </>
        );
        return (
          <li key={r.key}>
            {r.href ? (
              <Link
                href={r.href}
                className="relative flex h-9 items-center gap-3 rounded-[8px] px-2.5 transition-colors hover:bg-hover"
              >
                {inner}
              </Link>
            ) : (
              <div className="relative flex h-9 items-center gap-3 px-2.5">{inner}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
};

/* ---------- When students study: weekday × hour ---------- */

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const hourLabel = (h: number) => `${String(h).padStart(2, "0")}:00`;

export const WeekHeatmap: FC<{ grid: number[][] }> = ({ grid }) => {
  const { ref, width } = useSize<HTMLDivElement>();
  const [active, setActive] = useState<{ d: number; h: number } | null>(null);
  const max = Math.max(1, ...grid.flat());
  const left = 34;
  const cell = width ? Math.max(8, (width - left) / 24) : 0;
  const rowH = Math.min(26, Math.max(16, cell * 0.9));
  const height = rowH * 7 + 20;
  const step = (v: number) => (v ? Math.max(1, Math.ceil((v / max) * SEQ_STEPS)) : 0);

  return (
    <div ref={ref} className="relative w-full" style={{ height }}>
      {width > 0 && (
        <svg width={width} height={height} aria-hidden="true" onPointerLeave={() => setActive(null)}>
          {grid.map((row, d) => (
            <g key={d}>
              <text x={0} y={d * rowH + rowH / 2} dy="0.32em" className="fill-muted font-mono text-[10.5px]">
                {DAYS[d].slice(0, 3)}
              </text>
              {row.map((v, h) => (
                <rect
                  key={h}
                  x={left + h * cell + 1}
                  y={d * rowH + 1}
                  width={Math.max(1, cell - 2)}
                  height={rowH - 2}
                  rx={3}
                  fill={v ? seqColor(step(v)) : "var(--hover)"}
                  stroke={active?.d === d && active?.h === h ? "var(--ink)" : "none"}
                  strokeWidth="1.5"
                  onPointerEnter={() => setActive({ d, h })}
                />
              ))}
            </g>
          ))}
          {[0, 3, 6, 9, 12, 15, 18, 21].map((h) => (
            <text key={h} x={left + h * cell + 1} y={height - 4} className="fill-muted font-mono text-[10.5px]">
              {String(h).padStart(2, "0")}
            </text>
          ))}
        </svg>
      )}
      {active && (
        <ChartTooltip
          x={left + (active.h + 0.5) * cell}
          y={active.d * rowH - 6}
          width={width}
          title={`${DAYS[active.d]}s, ${hourLabel(active.h)}–${hourLabel((active.h + 1) % 24)}`}
          rows={[
            {
              key: "n",
              value: formatNumber(grid[active.d][active.h]),
              label: grid[active.d][active.h] === 1 ? "student studying" : "students studying",
            },
          ]}
        />
      )}
      <SrTable
        caption="Students studying by day of the week and hour, Lagos time, added up over the range"
        head={["Day", ...Array.from({ length: 24 }, (_, h) => hourLabel(h))]}
        rows={grid.map((row, d) => [DAYS[d], ...row])}
      />
    </div>
  );
};

/** The busiest day and hour, in words. */
export const busiestSlot = (grid: number[][]) => {
  let best = { d: 0, h: 0, v: -1 };
  grid.forEach((row, d) => row.forEach((v, h) => v > best.v && (best = { d, h, v })));
  if (best.v <= 0) return null;
  const dayTotals = grid.map((row) => row.reduce((a, b) => a + b, 0));
  const hourTotals = Array.from({ length: 24 }, (_, h) => grid.reduce((a, row) => a + row[h], 0));
  const day = dayTotals.indexOf(Math.max(...dayTotals));
  const hour = hourTotals.indexOf(Math.max(...hourTotals));
  return { day: DAYS[day], hour: hourLabel(hour) };
};

/* ---------- Retention ---------- */

export const CohortTable: FC<{
  cohorts: { week: string; size: number; weeks: (number | null)[] }[];
  weekLabel: (monday: string) => string;
}> = ({ cohorts, weekLabel }) => {
  const span = cohorts[0]?.weeks.length ?? 8;
  return (
    <div className="relative -mx-1 overflow-x-auto px-1">
      <table className="!table w-full min-w-[520px] border-separate border-spacing-[3px] text-[12px]">
        <caption className="sr-only">
          Of the students who signed up each week, the share who used the app again in each week after
        </caption>
        <thead>
          <tr>
            <th scope="col" className="pb-1 text-left font-semibold text-subtle">
              Signed up
            </th>
            <th scope="col" className="pb-1 text-right font-semibold text-subtle">
              People
            </th>
            {Array.from({ length: span }, (_, w) => (
              <th key={w} scope="col" className="pb-1 text-center font-semibold text-subtle">
                <span aria-hidden="true">{w === 0 ? "Wk 1" : `Wk ${w + 1}`}</span>
                <span className="sr-only">{w === 0 ? "First week" : `Week ${w + 1}`}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cohorts.map((c) => (
            <tr key={c.week}>
              <th scope="row" className="whitespace-nowrap pr-2 text-left font-mono font-medium text-body">
                {weekLabel(c.week)}
              </th>
              <td className="pr-2 text-right font-semibold text-ink tabular-nums">{formatNumber(c.size)}</td>
              {c.weeks.map((n, w) => {
                if (n === null || !c.size)
                  return (
                    <td key={w} className="h-8 rounded-[6px] bg-well text-center text-faint">
                      <span aria-hidden="true">·</span>
                      <span className="sr-only">Not yet</span>
                    </td>
                  );
                const share = (n / c.size) * 100;
                const step = n ? Math.max(1, Math.min(SEQ_STEPS, Math.ceil((share / 40) * SEQ_STEPS))) : 0;
                return (
                  <td
                    key={w}
                    title={`${formatNumber(n)} of ${formatNumber(c.size)}`}
                    className="h-8 min-w-[44px] rounded-[6px] text-center font-semibold tabular-nums"
                    style={{
                      background: step ? seqColor(step) : "var(--hover)",
                      color: step >= 5 ? "var(--seq-fg-high)" : "var(--seq-fg-low)",
                    }}
                  >
                    {pct(share)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* ---------- Scores ---------- */

export const ScoreBars: FC<{ buckets: number[]; average: number | null }> = ({ buckets, average }) => {
  // 100% joins the 90s: ten bands.
  const bands = [...buckets.slice(0, 9), (buckets[9] ?? 0) + (buckets[10] ?? 0)];
  const max = Math.max(1, ...bands);
  const [active, setActive] = useState<number | null>(null);
  const total = bands.reduce((a, b) => a + b, 0);
  return (
    <div className="flex flex-col gap-2">
      <div className="relative flex h-[132px] items-end gap-1.5 border-b border-[var(--viz-axis)]" onPointerLeave={() => setActive(null)}>
        {/* Pass mark at 50%. */}
        <span aria-hidden="true" className="absolute inset-y-0 left-1/2 border-l border-dashed border-[var(--viz-axis)]" />
        {bands.map((n, i) => (
          <div
            key={i}
            className="relative flex h-full flex-1 items-end"
            onPointerEnter={() => setActive(i)}
          >
            <div
              className="w-full rounded-t-[4px] transition-opacity"
              style={{
                height: `${n ? Math.max(2, (n / max) * 100) : 0}%`,
                background: "var(--viz-primary)",
                opacity: active === null || active === i ? (i < 5 ? 0.55 : 1) : 0.3,
              }}
            />
            {active === i && (
              <span className="absolute -top-1 left-1/2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-[8px] border border-line bg-surface px-2 py-1 text-[12px] shadow-lift">
                <b className="font-bold text-ink tabular-nums">{formatNumber(n)}</b>{" "}
                <span className="text-subtle">
                  scored {i * 10}–{i === 9 ? 100 : i * 10 + 9}%
                </span>
              </span>
            )}
          </div>
        ))}
      </div>
      <div aria-hidden="true" className="flex justify-between font-mono text-[10.5px] text-muted">
        <span>0%</span>
        <span>50% pass</span>
        <span>100%</span>
      </div>
      <SrTable
        caption={`Finished tests by score${average !== null ? `, average ${average}%` : ""}`}
        head={["Score", "Tests"]}
        rows={bands.map((n, i) => [`${i * 10}–${i === 9 ? 100 : i * 10 + 9}%`, n])}
      />
      {total === 0 && <p className="text-[13px] text-muted">No finished tests in this range.</p>}
    </div>
  );
};
