import React, { FC, useMemo, useState } from "react";
import { formatNumber } from "../format";
import { addDays } from "../range";
import { ChartTooltip, SEQ_STEPS, SrTable, seqColor, useSize } from "./base";

const cal = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", ...o });
const asDate = (day: string) => new Date(`${day}T12:00:00Z`);
const mondayOf = (day: string) => addDays(day, -((asDate(day).getUTCDay() + 6) % 7));

/** Longest run of consecutive days with something done. */
export const longestStreak = (days: Set<string>) => {
  let best = 0;
  for (const d of Array.from(days)) {
    if (days.has(addDays(d, -1))) continue;
    let n = 1;
    while (days.has(addDays(d, n))) n++;
    best = Math.max(best, n);
  }
  return best;
};

/**
 * A year of days as small squares (weeks across, Monday to Sunday down), shaded by how much
 * the person did that day.
 */
export const YearCalendar: FC<{ counts: { day: string; count: number }[]; today: string }> = ({ counts, today }) => {
  const { ref, width } = useSize<HTMLDivElement>();
  const [active, setActive] = useState<{ day: string; x: number; y: number } | null>(null);
  const byDay = useMemo(() => new Map(counts.map((c) => [c.day, c.count])), [counts]);
  const max = Math.max(1, ...counts.map((c) => c.count));
  const start = mondayOf(addDays(today, -364));
  const weeks = Math.ceil((Math.round((asDate(today).getTime() - asDate(start).getTime()) / 86_400_000) + 1) / 7);
  const left = 28;
  const top = 16;
  const gap = 3;
  const cell = width ? Math.max(6, Math.min(18, (width - left) / weeks - gap)) : 0;
  const height = top + 7 * (cell + gap);
  const step = (n: number) => (n ? Math.max(1, Math.ceil((n / max) * SEQ_STEPS)) : 0);

  const months: { x: number; label: string }[] = [];
  for (let w = 0; w < weeks; w++) {
    const d = addDays(start, w * 7);
    const prev = addDays(d, -7);
    if (w === 0 || d.slice(5, 7) !== prev.slice(5, 7)) {
      if (w > weeks - 3 && w !== 0) continue;
      months.push({ x: left + w * (cell + gap), label: cal({ month: "short" }).format(asDate(d)) });
    }
  }

  return (
    <div ref={ref} className="relative w-full" style={{ height: height || 120 }}>
      {width > 0 && (
        <svg width={width} height={height} aria-hidden="true" onPointerLeave={() => setActive(null)}>
          {months.map((m, i) =>
            i === 0 && months[1] && months[1].x - m.x < 28 ? null : (
              <text key={`${m.label}${m.x}`} x={m.x} y={10} className="fill-muted font-mono text-[10px]">
                {m.label}
              </text>
            )
          )}
          {["Mon", "", "Wed", "", "Fri", "", ""].map((d, i) =>
            d ? (
              <text key={d} x={0} y={top + i * (cell + gap) + cell / 2} dy="0.32em" className="fill-muted font-mono text-[10px]">
                {d}
              </text>
            ) : null
          )}
          {Array.from({ length: weeks }, (_, w) =>
            Array.from({ length: 7 }, (_, d) => {
              const day = addDays(start, w * 7 + d);
              if (day > today) return null;
              const n = byDay.get(day) ?? 0;
              const x = left + w * (cell + gap);
              const y = top + d * (cell + gap);
              return (
                <rect
                  key={day}
                  x={x}
                  y={y}
                  width={cell}
                  height={cell}
                  rx={Math.min(3, cell / 4)}
                  fill={n ? seqColor(step(n)) : "var(--hover)"}
                  stroke={active?.day === day ? "var(--ink)" : "none"}
                  strokeWidth="1.5"
                  onPointerEnter={() => setActive({ day, x: x + cell / 2, y })}
                />
              );
            })
          )}
        </svg>
      )}
      {active && (
        <ChartTooltip
          x={active.x}
          y={active.y - 8}
          width={width}
          title={cal({ weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(asDate(active.day))}
          rows={[{ key: "n", value: formatNumber(byDay.get(active.day) ?? 0), label: (byDay.get(active.day) ?? 0) === 1 ? "action" : "actions" }]}
        />
      )}
      <SrTable
        caption="Actions per day over the last year (days with none left out)"
        head={["Day", "Actions"]}
        rows={[...counts].sort((a, b) => a.day.localeCompare(b.day)).map((c) => [c.day, c.count])}
      />
    </div>
  );
};
