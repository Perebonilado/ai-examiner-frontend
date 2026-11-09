import React, {
  FC,
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/router";

export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "aix-theme";
/** Public marketing pages: designed around light imagery, so they stay light. */
export const LIGHT_ONLY_ROUTES = ["/", "/pricing", "/privacy-policy", "/payment-confirmation"];

/**
 * Runs in <head> before the first paint (see pages/_document.tsx), so a saved or system dark theme
 * never flashes light. Keep in step with resolveTheme below.
 */
export const themeBootScript = `(function(){try{var p=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY
)});var light=${JSON.stringify(
  LIGHT_ONLY_ROUTES
)}.indexOf(location.pathname)>-1;var d=!light&&(p==="dark"||((!p||p==="system")&&window.matchMedia("(prefers-color-scheme: dark)").matches));var r=document.documentElement;r.setAttribute("data-theme",d?"dark":"light");r.style.colorScheme=d?"dark":"light";}catch(e){}})();`;

const resolveTheme = (
  preference: ThemePreference,
  systemDark: boolean,
  forcedLight: boolean
): ResolvedTheme =>
  forcedLight
    ? "light"
    : preference === "system"
    ? systemDark
      ? "dark"
      : "light"
    : preference;

const readPreference = (): ThemePreference => {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved === "light" || saved === "dark" ? saved : "system";
  } catch {
    return "system";
  }
};

interface ThemeContextValue {
  /** What the person chose. */
  preference: ThemePreference;
  /** What's on screen now. */
  resolved: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  preference: "system",
  resolved: "light",
  setPreference: () => {},
});

export const useTheme = () => useContext(ThemeContext);

/** Light / dark / follow the system, saved on this device, applied as data-theme on <html>. */
const ThemeProvider: FC<PropsWithChildren> = ({ children }) => {
  const { pathname } = useRouter();
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [systemDark, setSystemDark] = useState(false);
  // Until the saved choice is read, leave <html> as the boot script set it.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setPreferenceState(readPreference());
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemDark(media.matches);
    const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    media.addEventListener("change", onChange);
    // Another tab changed the theme.
    const onStorage = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY) setPreferenceState(readPreference());
    };
    window.addEventListener("storage", onStorage);
    setReady(true);
    return () => {
      media.removeEventListener("change", onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const resolved = resolveTheme(
    preference,
    systemDark,
    LIGHT_ONLY_ROUTES.includes(pathname)
  );

  useEffect(() => {
    if (!ready) return;
    const root = document.documentElement;
    root.setAttribute("data-theme", resolved);
    root.style.colorScheme = resolved;
  }, [resolved, ready]);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    try {
      if (next === "system") localStorage.removeItem(THEME_STORAGE_KEY);
      else localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {}
  }, []);

  return (
    <ThemeContext.Provider value={{ preference, resolved, setPreference }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
