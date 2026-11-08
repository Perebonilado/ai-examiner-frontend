import React, { FC } from "react";
import cn from "classnames";

type SpinnerSize = "xs" | "sm" | "md" | "lg";

interface Props {
  /** xs 16 · sm 24 · md 36 · lg 56, or a pixel size. */
  size?: SpinnerSize | number;
  /**
   * accent: the brand arc on a light track (default)
   * onDark: for dark overlays
   * current: follows the text colour (inside buttons)
   */
  tone?: "accent" | "onDark" | "current";
  /** Announced to screen readers. Leave out when visible text already says what's loading. */
  label?: string;
  className?: string;
}

const SIZES: Record<SpinnerSize, number> = { xs: 16, sm: 24, md: 36, lg: 56 };

const TONES = {
  accent: { track: "var(--line)", arc: "var(--accent)" },
  onDark: { track: "rgba(255,255,255,0.16)", arc: "var(--accent-300)" },
  current: { track: "currentColor", arc: "currentColor" },
};

/**
 * The app's loading indicator: a thin arc with rounded ends that lengthens and shortens as it
 * turns (a steady turn for reduced motion). Styles: `.aix-spinner` in globals.css.
 */
const Spinner: FC<Props> = ({ size = "md", tone = "accent", label, className }) => {
  const px = typeof size === "number" ? size : SIZES[size];
  // Keep the stroke optically even: thicker relative to small sizes.
  const stroke = px <= 16 ? 5 : px <= 24 ? 4.25 : 3.5;
  const { track, arc } = TONES[tone];

  const svg = (
    <svg
      className={cn("aix-spinner shrink-0", !label && className)}
      width={px}
      height={px}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="20"
        cy="20"
        r="16"
        stroke={track}
        strokeWidth={stroke}
        opacity={tone === "current" ? 0.22 : 1}
      />
      <circle
        className="aix-spinner-arc"
        cx="20"
        cy="20"
        r="16"
        stroke={arc}
        strokeWidth={stroke}
        strokeLinecap="round"
        pathLength={100}
      />
    </svg>
  );

  if (!label) return svg;
  return (
    <span role="status" className={cn("inline-flex", className)}>
      {svg}
      <span className="sr-only">{label}</span>
    </span>
  );
};

export default Spinner;
