import React, { FC, KeyboardEvent, PointerEvent, useState } from "react";
import { formatNumber } from "../format";
import { ChartTooltip, SrTable, compact, labelIndexes, niceTicks, useSize } from "./base";

export interface HistogramGroup {
  key: string;
  label: string;
  color: string;
}

interface Props {
  /** Stack order, bottom first. */
  groups: HistogramGroup[];
  buckets: { label: string; title: string; counts: Record<string, number> }[];
  /** Drag across bars (or click one) to zoom to them; omitted = no zoom. */
  onSelect?: (from: number, to: number) => void;
  /** Wording for the zoom hint ("day", "week"). */
  height?: number;
  caption: string;
}

const PAD = { top: 8, right: 4, bottom: 22, left: 36 };

/**
 * Volume over time, stacked by kind: the log explorer's histogram. Hover a bar for its
 * breakdown; drag across bars to zoom the range to them.
 */
export const StackedHistogram: FC<Props> = ({ groups, buckets, onSelect, height = 150, caption }) => {
  const { ref, width } = useSize<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const [drag, setDrag] = useState<{ from: number; to: number } | null>(null);
  const n = buckets.length;
  const totals = buckets.map((b) => groups.reduce((sum, g) => sum + (b.counts[g.key] ?? 0), 0));
  const ticks = niceTicks(Math.max(1, ...totals), 3);
  const top = ticks[ticks.length - 1];
  const plotW = Math.max(0, width - PAD.left - PAD.right);
  const plotH = height - PAD.top - PAD.bottom;
  const slot = n ? plotW / n : 0;
  const gap = slot > 6 ? 2 : slot > 3 ? 1 : 0;
  const y = (v: number) => PAD.top + plotH - (v / top) * plotH;

  const indexAt = (e: PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return Math.max(0, Math.min(n - 1, Math.floor((e.clientX - rect.left - PAD.left) / slot)));
  };
  const onDown = (e: PointerEvent<SVGSVGElement>) => {
    if (!onSelect || !n) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const i = indexAt(e);
    setDrag({ from: i, to: i });
  };
  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    if (!n) return;
    const i = indexAt(e);
    setActive(i);
    if (drag) setDrag({ ...drag, to: i });
  };
  const onUp = () => {
    if (drag && onSelect) onSelect(Math.min(drag.from, drag.to), Math.max(drag.from, drag.to));
    setDrag(null);
  };
  const onKey = (e: KeyboardEvent<SVGSVGElement>) => {
    if (!n) return;
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      setActive((a) => Math.max(0, Math.min(n - 1, (a ?? n - 1) + (e.key === "ArrowRight" ? 1 : -1))));
    }
    if (e.key === "Enter" && active !== null && onSelect) onSelect(active, active);
    if (e.key === "Escape") setActive(null);
  };

  const sel = drag ? { from: Math.min(drag.from, drag.to), to: Math.max(drag.from, drag.to) } : null;
  const shown = labelIndexes(n, Math.max(2, Math.min(10, Math.floor(plotW / 70))));

  return (
    <div ref={ref} className="relative w-full select-none" style={{ height }}>
      {width > 0 && (
        <svg
          width={width}
          height={height}
          role="img"
          tabIndex={0}
          aria-label={`${caption}. Use the arrow keys to read each bar${onSelect ? ", Enter to zoom in" : ""}.`}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={() => !drag && setActive(null)}
          onKeyDown={onKey}
          onBlur={() => setActive(null)}
          className={`block touch-pan-y outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-bright ${onSelect ? "cursor-crosshair" : ""}`}
        >
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={PAD.left}
                x2={width - PAD.right}
                y1={y(t)}
                y2={y(t)}
                stroke={t === 0 ? "var(--viz-axis)" : "var(--viz-grid)"}
                shapeRendering="crispEdges"
              />
              <text x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-muted font-mono text-[10.5px]">
                {compact(t)}
              </text>
            </g>
          ))}
          {sel && (
            <rect
              x={PAD.left + sel.from * slot}
              y={PAD.top}
              width={(sel.to - sel.from + 1) * slot}
              height={plotH}
              fill="var(--viz-primary)"
              fillOpacity="0.1"
              stroke="var(--viz-primary)"
              strokeOpacity="0.5"
            />
          )}
          {buckets.map((b, i) => {
            let base = 0;
            const x = PAD.left + i * slot + gap / 2;
            const w = Math.max(1, slot - gap);
            const dim = active !== null && active !== i && !sel;
            return (
              <g key={i} opacity={dim ? 0.5 : 1}>
                {groups.map((g) => {
                  const v = b.counts[g.key] ?? 0;
                  if (!v) return null;
                  const y0 = y(base);
                  const y1 = y(base + v);
                  base += v;
                  // A 1px surface gap between stacked kinds.
                  const h = Math.max(1, y0 - y1 - (w > 4 ? 1 : 0));
                  return <rect key={g.key} x={x} y={y1} width={w} height={h} fill={g.color} rx={w > 8 ? 1.5 : 0} />;
                })}
              </g>
            );
          })}
          {shown.map((i) => (
            <text
              key={i}
              x={PAD.left + (i + 0.5) * slot}
              y={height - 5}
              textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"}
              className="fill-muted font-mono text-[10.5px]"
            >
              {buckets[i].label}
            </text>
          ))}
        </svg>
      )}
      {active !== null && width > 0 && buckets[active] && (
        <ChartTooltip
          x={PAD.left + (active + 0.5) * slot}
          y={4}
          width={width}
          title={buckets[active].title}
          rows={[...groups]
            .reverse()
            .filter((g) => buckets[active].counts[g.key])
            .map((g) => ({ key: g.key, color: g.color, value: formatNumber(buckets[active].counts[g.key]), label: g.label }))}
          footer={
            <>
              <b className="font-bold text-ink tabular-nums">{formatNumber(totals[active])}</b> in all
              {onSelect && <span className="text-muted"> · click to zoom in</span>}
            </>
          }
        />
      )}
      <SrTable
        caption={caption}
        head={["When", ...groups.map((g) => g.label), "All"]}
        rows={buckets.map((b, i) => [b.title, ...groups.map((g) => b.counts[g.key] ?? 0), totals[i]])}
      />
    </div>
  );
};
