import type { Config } from "tailwindcss";

/* Design tokens for the AI Examiner redesign (EasiRead family).
   Values live as CSS variables in styles/globals.css; Tailwind names point at them. */
const v = (name: string) => `var(--${name})`;

const config: Config = {
  // `dark:` applies under <html data-theme="dark"> (ThemeContext sets it). Most colours need no
  // `dark:` at all: the tokens below change value with the theme.
  darkMode: ["selector", '[data-theme="dark"]'],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./@modules/**/*.{js,ts,jsx,tsx,mdx}",
    "./@shared/**/*.{js,ts,jsx,tsx,mdx}",
    "./layouts/**/*.{js,ts,jsx,tsx,mdx}",
    "./contexts/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        proxima: ['"Proxima Nova"', "sans-serif"],
      },
      colors: {
        ink: v("ink"),
        body: v("body"),
        subtle: v("subtle"),
        muted: v("muted"),
        faint: v("faint"),
        surface: v("surface"),
        canvas: v("canvas"),
        rail: v("rail"),
        sunken: v("sunken"),
        well: v("well"),
        hover: v("hover"),
        line: v("line"),
        edge: v("edge"),
        control: v("control"),
        brand: { DEFAULT: v("brand"), hover: v("brand-hover"), press: v("brand-press") },
        accent: {
          DEFAULT: v("accent"),
          bright: v("accent-bright"),
          50: v("accent-50"),
          100: v("accent-100"),
          200: v("accent-200"),
          300: v("accent-300"),
          900: v("accent-900"),
        },
        "on-accent": v("on-accent"),
        "on-success": v("on-success"),
        "on-danger": v("on-danger"),
        inverse: v("inverse"),
        "on-inverse": v("on-inverse"),
        "surface-glass": v("surface-glass"),
        "control-strong": v("control-strong"),
        success: { DEFAULT: v("success"), strong: v("success-strong"), bg: v("success-bg"), line: v("success-line") },
        danger: { DEFAULT: v("danger"), strong: v("danger-strong"), bg: v("danger-bg"), line: v("danger-line") },
        warning: { DEFAULT: v("warning"), bg: v("warning-bg"), line: v("warning-line") },
      },
      boxShadow: {
        xs: v("shadow-xs"),
        soft: v("shadow-soft"),
        lift: v("shadow-lift"),
        pop: v("shadow-pop"),
        page: v("page-shadow"),
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
