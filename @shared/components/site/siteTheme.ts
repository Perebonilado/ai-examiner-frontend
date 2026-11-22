import { CSSProperties } from "react";
import cn from "classnames";
import { lexend } from "./fonts";

/** The marketing site's palette (home, pricing, privacy policy, payment confirmation). Light only. */
export const sitePalette = {
  "--hy": "#f4cb5a", // yellow
  "--hp": "#5b2ad6", // purple
  "--hp-hover": "#4a1dbf",
  "--hk": "#0e0e10", // ink
  "--hcream": "#fbf1cc", // headline marker
} as CSSProperties;

/** Lexend, the site's type, for a header, footer or whole page. */
export const siteFontClass = cn(lexend.variable, "font-[family-name:var(--font-home)] antialiased");
