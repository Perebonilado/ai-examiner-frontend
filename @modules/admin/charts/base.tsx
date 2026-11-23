import React, { FC, ReactNode, useEffect, useRef, useState } from "react";
import cn from "classnames";

/** The element's content box size, kept up to date. */
export const useSize = <T extends HTMLElement>() => {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setSize({ width: el.clientWidth, height: el.clientHeight });
    const observer = new ResizeObserver(([entry]) =>
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height })
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, ...size };
};

/** 3–5 round tick values from 0 up to at least `max`. */
export const niceTicks = (max: number, count = 4): number[] => {
  if (!(max > 0)) return [0, 1];
  const raw = max / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? 10 * mag;
  const top = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = 0; v <= top + step / 2; v += step) ticks.push(Math.round(v * 1000) / 1000);
  return ticks;
};

/** "950", "1.2k", "12k", "1.5M" for axis labels. */
export const compact = (v: number) => {
  const abs = Math.abs(v);
  if (abs >= 1e6) return `${(v / 1e6).toFixed(abs >= 1e7 ? 0 : 1).replace(/\.0$/, "")}M`;
  if (abs >= 1e3) return `${(v / 1e3).toFixed(abs >= 1e4 ? 0 : 1).replace(/\.0$/, "")}k`;
  return `${Math.round(v * 10) / 10}`;
};

/** Evenly spaced indexes for axis labels, always including the last. */
export const labelIndexes = (n: number, want: number) => {
  if (n <= want) return Array.from({ length: n }, (_, i) => i);
  const step = (n - 1) / (want - 1);
  return Array.from(new Set(Array.from({ length: want }, (_, i) => Math.round(i * step))));
};

/** A path for a bar whose top corners are rounded (the data end); the base stays square. */
export const topRoundedBar = (x: number, y: number, w: number, h: number, r = 3) => {
  if (h <= 0 || w <= 0) return "";
  const rr = Math.min(r, w / 2, h);
  return `M${x},${y + h} V${y + rr} Q${x},${y} ${x + rr},${y} H${x + w - rr} Q${x + w},${y} ${x + w},${y + rr} V${y + h} Z`;
};

/** Sequential steps (light → dark) for heat cells, read from CSS so both themes work. */
export const SEQ_STEPS = 8;
export const seqColor = (step: number) => `var(--seq-${Math.max(0, Math.min(SEQ_STEPS, step))})`;

export interface TooltipRow {
  key: string;
  /** Series colour for the short line key. */
  color?: string;
  dashed?: boolean;
  value: ReactNode;
  label: ReactNode;
}

/**
 * The floating readout: the value leads, the series name follows. Positioned inside the
 * chart's relative box; flips left near the right edge.
 */
export const ChartTooltip: FC<{
  x: number;
  y: number;
  width: number;
  title: ReactNode;
  rows: TooltipRow[];
  footer?: ReactNode;
}> = ({ x, y, width, title, rows, footer }) => {
  const flip = x > width * 0.62;
  return (
    <div
      role="presentation"
      className="pointer-events-none absolute z-10 min-w-[160px] max-w-[260px] rounded-[10px] border border-line bg-surface px-3 py-2.5 shadow-lift"
      style={{
        left: flip ? undefined : x + 14,
        right: flip ? width - x + 14 : undefined,
        top: Math.max(0, y),
      }}
    >
      <p className="mb-1.5 text-[12px] font-semibold text-subtle">{title}</p>
      <ul className="flex flex-col gap-1">
        {rows.map((r) => (
          <li key={r.key} className="flex items-center gap-2 text-[12.5px]">
            {r.color && (
              <svg width="14" height="6" aria-hidden="true" className="shrink-0">
                <line
                  x1="1"
                  y1="3"
                  x2="13"
                  y2="3"
                  stroke={r.color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray={r.dashed ? "3 3" : undefined}
                />
              </svg>
            )}
            <b className="font-bold text-ink tabular-nums">{r.value}</b>
            <span className="min-w-0 truncate text-subtle">{r.label}</span>
          </li>
        ))}
      </ul>
      {footer && <div className="mt-1.5 border-t border-line pt-1.5 text-[12px] text-subtle">{footer}</div>}
    </div>
  );
};

/** The same numbers as a chart, for screen readers. */
export const SrTable: FC<{ caption: string; head: string[]; rows: (string | number)[][] }> = ({
  caption,
  head,
  rows,
}) => (
  <div className="sr-only">
    {/* `!table`: globals.css hides every table (Google Translate workaround). */}
    <table className="!table">
      <caption>{caption}</caption>
      <thead>
        <tr>
          {head.map((h) => (
            <th key={h} scope="col">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            {r.map((c, j) => (j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j}>{c}</td>))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/** A tiny trend line for a KPI card (decorative: the number beside it says it). */
export const Sparkline: FC<{ values: number[]; className?: string; partialLast?: boolean }> = ({
  values,
  className,
  partialLast,
}) => {
  if (values.length < 2) return <span className={cn("block h-7", className)} aria-hidden="true" />;
  const max = Math.max(1, ...values);
  const pts = values.map((v, i) => [(i / (values.length - 1)) * 100, 26 - (v / max) * 24] as const);
  const whole = partialLast ? pts.slice(0, -1) : pts;
  const line = (p: readonly (readonly [number, number])[]) => p.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join(" ");
  return (
    <svg viewBox="0 0 100 28" preserveAspectRatio="none" aria-hidden="true" className={cn("block h-7 w-full", className)}>
      <path d={`${line(whole)} L${whole[whole.length - 1][0]},28 L0,28 Z`} fill="currentColor" opacity="0.08" />
      <path d={line(whole)} fill="none" stroke="currentColor" strokeWidth="1.75" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      {partialLast && (
        <path
          d={line(pts.slice(-2))}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeDasharray="3 3"
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  );
};
