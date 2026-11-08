import React, { FC } from "react";

/* Topics passed vs topics that need work, as a small SVG donut (replaces chart.js here).
   Same two colours as the per-topic bars: passed in soft violet, needs work in a muted red. */

interface Props {
  passed: number;
  needsWork: number;
}

const R = 55;
const C = 2 * Math.PI * R;

const TopicPerformancePieChart: FC<Props> = ({ passed, needsWork }) => {
  const total = passed + needsWork;
  const segments = [
    { key: "pass", n: passed, label: "Passed", cls: "stroke-accent-300" },
    { key: "weak", n: needsWork, label: "Needs work", cls: "stroke-[#e2665b]" },
  ].filter((s) => s.n > 0);
  // a hairline of surface between the two segments
  const gap = segments.length > 1 ? 2.5 : 0;

  let at = 0;
  const arcs = segments.map((s) => {
    const len = (s.n / total) * C;
    const dash = Math.max(len - gap, 0);
    const offset = -(at + gap / 2);
    at += len;
    return { ...s, dash, offset };
  });

  return (
    <div
      role="img"
      aria-label={`${passed} of ${total} topics passed, ${needsWork} ${
        needsWork === 1 ? "needs" : "need"
      } more work`}
      className="relative h-[120px] w-[120px] md:h-[132px] md:w-[132px]"
    >
      <svg viewBox="0 0 120 120" aria-hidden="true" className="block h-full w-full">
        {total === 0 ? (
          <circle cx="60" cy="60" r={R} fill="none" strokeWidth={9} className="stroke-sunken" />
        ) : (
          // start at 12 o'clock and run clockwise: passed first, then needs work
          <g transform="rotate(-90 60 60)">
            {arcs.map((a) => (
              <circle
                key={a.key}
                cx="60"
                cy="60"
                r={R}
                fill="none"
                strokeWidth={9}
                className={a.cls}
                strokeDasharray={`${a.dash.toFixed(2)} ${(C - a.dash).toFixed(2)}`}
                strokeDashoffset={a.offset.toFixed(2)}
              >
                <title>{`${a.label}: ${a.n} of ${total} topics`}</title>
              </circle>
            ))}
          </g>
        )}
      </svg>
      <div
        aria-hidden="true"
        className="absolute inset-0 flex flex-col items-center justify-center text-center"
      >
        <b className="text-[22px] font-bold leading-[1.1] tracking-[-0.02em] text-ink tabular-nums">
          {passed}/{total}
        </b>
        <span className="mt-0.5 text-xs leading-[1.3] text-subtle">topics passed</span>
      </div>
    </div>
  );
};

export default TopicPerformancePieChart;
