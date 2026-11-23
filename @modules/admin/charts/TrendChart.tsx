import React, { FC, KeyboardEvent, PointerEvent, useState } from "react";
import { ChartTooltip, SrTable, compact, labelIndexes, niceTicks, topRoundedBar, useSize } from "./base";

interface Props {
  /** Short axis label per point ("23 Nov"). */
  labels: string[];
  /** Tooltip title per point ("Mon 23 Nov", "Week of 16 Nov"). */
  titles: string[];
  values: number[];
  /** The previous period, point for point (may be shorter or longer). */
  previous?: number[];
  previousTitles?: string[];
  /** Full value ("1,204", "₦45,000"). */
  format: (v: number) => string;
  /** What the line counts ("Active students"). */
  name: string;
  /** The last point is still filling up (today, this week): drawn dashed and marked "so far". */
  partialLast?: boolean;
  /** Runs of points with no data at all (an outage), shaded and labelled. */
  gaps?: { from: number; to: number }[];
  height?: number;
}

const PAD = { top: 12, right: 8, bottom: 26, left: 44 };

/**
 * The overview's main chart: this period as a line over a flat fill (bars for a week or less),
 * the previous period dashed behind it, and a crosshair readout that lists both.
 */
export const TrendChart: FC<Props> = ({
  labels,
  titles,
  values,
  previous,
  previousTitles,
  format,
  name,
  partialLast = false,
  gaps = [],
  height = 280,
}) => {
  const { ref, width } = useSize<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const n = values.length;
  const bars = n <= 8;
  const prev = previous?.slice(0, Math.max(n, 1)) ?? [];
  const max = Math.max(1, ...values, ...prev);
  const ticks = niceTicks(max);
  const top = ticks[ticks.length - 1];
  const plotW = Math.max(0, width - PAD.left - PAD.right);
  const plotH = height - PAD.top - PAD.bottom;
  const y = (v: number) => PAD.top + plotH - (v / top) * plotH;
  const slot = n ? plotW / n : plotW;
  const x = (i: number) => (bars ? PAD.left + slot * (i + 0.5) : PAD.left + (n > 1 ? (i / (n - 1)) * plotW : plotW / 2));

  const linePath = (vals: number[], upto = vals.length) =>
    vals
      .slice(0, upto)
      .map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`)
      .join(" ");
  const whole = partialLast && n > 1 ? n - 1 : n;

  const indexAt = (clientX: number, el: Element) => {
    const rect = el.getBoundingClientRect();
    const px = clientX - rect.left;
    if (bars) return Math.max(0, Math.min(n - 1, Math.floor((px - PAD.left) / slot)));
    return Math.max(0, Math.min(n - 1, Math.round(((px - PAD.left) / plotW) * (n - 1))));
  };
  const onMove = (e: PointerEvent<SVGSVGElement>) => n && setActive(indexAt(e.clientX, e.currentTarget));
  const onKey = (e: KeyboardEvent<SVGSVGElement>) => {
    if (!n) return;
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      setActive((a) => Math.max(0, Math.min(n - 1, (a ?? n - 1) + (e.key === "ArrowRight" ? 1 : -1))));
    }
    if (e.key === "Escape") setActive(null);
  };

  const shown = labelIndexes(n, Math.max(2, Math.min(8, Math.floor(plotW / 84))));
  const barW = Math.max(2, Math.min(44, slot * 0.56));

  return (
    <div ref={ref} className="relative w-full select-none" style={{ height }}>
      {width > 0 && (
        <svg
          width={width}
          height={height}
          role="img"
          tabIndex={0}
          aria-label={`${name}, ${n} points. Use the arrow keys to read each one.`}
          onPointerMove={onMove}
          onPointerLeave={() => setActive(null)}
          onKeyDown={onKey}
          onBlur={() => setActive(null)}
          className="block touch-pan-y outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-bright"
        >
          {/* Grid and y axis */}
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={PAD.left}
                x2={width - PAD.right}
                y1={y(t)}
                y2={y(t)}
                stroke={t === 0 ? "var(--viz-axis)" : "var(--viz-grid)"}
                strokeWidth="1"
                shapeRendering="crispEdges"
              />
              <text
                x={PAD.left - 10}
                y={y(t)}
                dy="0.32em"
                textAnchor="end"
                className="fill-muted font-mono text-[11px] tabular-nums"
              >
                {compact(t)}
              </text>
            </g>
          ))}
          {/* No data recorded */}
          {gaps.map((g) => {
            const x0 = bars ? PAD.left + slot * g.from : x(Math.max(0, g.from - 0.5));
            const x1 = bars ? PAD.left + slot * (g.to + 1) : x(Math.min(n - 1, g.to + 0.5));
            return (
              <g key={`${g.from}-${g.to}`} pointerEvents="none">
                <rect x={x0} y={PAD.top} width={Math.max(0, x1 - x0)} height={plotH} fill="var(--hover)" opacity="0.7" />
                {x1 - x0 > 70 && (
                  <text x={(x0 + x1) / 2} y={PAD.top + 14} textAnchor="middle" className="fill-subtle text-[11px] font-semibold">
                    No data recorded
                  </text>
                )}
              </g>
            );
          })}
          {/* x labels */}
          {shown.map((i) => (
            <text
              key={i}
              x={x(i)}
              y={height - 6}
              textAnchor={!bars && i === 0 ? "start" : !bars && i === n - 1 ? "end" : "middle"}
              className="fill-muted font-mono text-[11px]"
            >
              {labels[i]}
            </text>
          ))}

          {bars ? (
            <>
              {values.map((v, i) => {
                const pv = prev[i];
                const w = barW;
                const cx = x(i);
                return (
                  <g key={i} opacity={active === null || active === i ? 1 : 0.55}>
                    {pv !== undefined && pv > 0 && (
                      <path
                        d={topRoundedBar(cx - w / 2 - w * 0.18, y(pv), w, y(0) - y(pv))}
                        fill="none"
                        stroke="var(--viz-prev)"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                      />
                    )}
                    <path
                      d={topRoundedBar(cx - w / 2, y(v), w, y(0) - y(v), 4)}
                      fill="var(--viz-primary)"
                      fillOpacity={partialLast && i === n - 1 ? 0.45 : 1}
                    />
                  </g>
                );
              })}
            </>
          ) : (
            <>
              {prev.length > 1 && (
                <path
                  d={linePath(prev)}
                  fill="none"
                  stroke="var(--viz-prev)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  strokeLinejoin="round"
                />
              )}
              {n > 1 && (
                <path
                  d={`${linePath(values, whole)} L${x(whole - 1)},${y(0)} L${x(0)},${y(0)} Z`}
                  fill="var(--viz-primary)"
                  fillOpacity="0.09"
                />
              )}
              <path
                d={linePath(values, whole)}
                fill="none"
                stroke="var(--viz-primary)"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {partialLast && n > 1 && (
                <path
                  d={`M${x(n - 2)},${y(values[n - 2])} L${x(n - 1)},${y(values[n - 1])}`}
                  fill="none"
                  stroke="var(--viz-primary)"
                  strokeWidth="2"
                  strokeDasharray="3 4"
                  strokeLinecap="round"
                />
              )}
              {n === 1 && <circle cx={x(0)} cy={y(values[0])} r="4" fill="var(--viz-primary)" />}
            </>
          )}

          {/* Crosshair */}
          {active !== null && (
            <g pointerEvents="none">
              {!bars && (
                <line
                  x1={x(active)}
                  x2={x(active)}
                  y1={PAD.top}
                  y2={y(0)}
                  stroke="var(--viz-axis)"
                  strokeWidth="1"
                  shapeRendering="crispEdges"
                />
              )}
              {!bars && prev[active] !== undefined && (
                <circle cx={x(active)} cy={y(prev[active])} r="3.5" fill="var(--surface)" stroke="var(--viz-prev)" strokeWidth="2" />
              )}
              {!bars && (
                <circle cx={x(active)} cy={y(values[active])} r="4.5" fill="var(--viz-primary)" stroke="var(--surface)" strokeWidth="2" />
              )}
            </g>
          )}
        </svg>
      )}
      {active !== null && width > 0 && (
        <ChartTooltip
          x={x(active)}
          y={Math.min(y(values[active]) - 20, height - 120)}
          width={width}
          title={
            <>
              {titles[active]}
              {partialLast && active === n - 1 ? " · so far" : ""}
            </>
          }
          rows={[
            { key: "cur", color: "var(--viz-primary)", value: format(values[active]), label: name },
            ...(prev[active] !== undefined
              ? [
                  {
                    key: "prev",
                    color: "var(--viz-prev)",
                    dashed: true,
                    value: format(prev[active]),
                    label: previousTitles?.[active] ?? "Previous period",
                  },
                ]
              : []),
          ]}
        />
      )}
      <SrTable
        caption={name}
        head={["When", name, ...(previous ? ["Previous period"] : [])]}
        rows={values.map((v, i) => [titles[i], format(v), ...(previous ? [prev[i] !== undefined ? format(prev[i]) : "–"] : [])])}
      />
    </div>
  );
};
