import React, { FC, ReactNode, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import cn from "classnames";
import { BookA, ChevronLeft, Feather, Lightbulb, Pointer, X } from "lucide-react";

/** A layout effect in the browser; a plain effect on the server, where layout effects never run
 *  and React would warn. */
const useBrowserLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* A small, working copy of the Easy Read reader for the home page: the same view switch,
   white pages on the grey canvas and highlight toolbar as the real reader.
   All text is written content for the demo; nothing is fetched. */

type Mode = "original" | "simplified" | "split";
type Action = "Explain" | "Simplify" | "Define";

const ACTIONS: { label: Action; Icon: typeof Lightbulb }[] = [
  { label: "Explain", Icon: Lightbulb },
  { label: "Simplify", Icon: Feather },
  { label: "Define", Icon: BookA },
];

const PHRASES: Record<string, { text: string; answers: Record<Action, string> }> = {
  av: {
    text: "atrioventricular valves",
    answers: {
      Explain:
        "These are the valves between the heart’s upper chambers (atria) and lower chambers (ventricles). When the ventricles start to squeeze, the valves snap shut so blood can’t flow backwards. That closing is the “lub” you hear (S1).",
      Simplify: "The valves between the upper and lower chambers. They snap shut as the lower chambers squeeze, which makes the “lub” (S1).",
      Define: "Atrioventricular (AV) valves: the mitral and tricuspid valves, between the atria and the ventricles.",
    },
  },
  semilunar: {
    text: "semilunar valves",
    answers: {
      Explain:
        "These valves sit at the heart’s exits, into the aorta and the pulmonary artery. Once the ventricles finish pumping, they close so blood can’t fall back in. That closing is the “dub” (S2).",
      Simplify: "The heart’s exit valves. They close once the blood has been pushed out, which makes the “dub” (S2).",
      Define: "Semilunar valves: the aortic and pulmonary valves, at the outflow of the left and right ventricles.",
    },
  },
  splitting: {
    text: "Physiological splitting",
    answers: {
      Explain:
        "Breathing in pulls more blood into the right side of the heart (increased venous return), so the pulmonary valve closes a moment after the aortic valve. You hear S2 as two quick taps. It’s normal and fades when you breathe out.",
      Simplify: "When you breathe in, S2 can sound like two quick taps. This is normal.",
      Define:
        "Physiological splitting of S2: a normal gap between aortic (A2) and pulmonary (P2) valve closure that widens on inspiration.",
    },
  },
};

/* ---------- the pages ---------- */

interface PhraseProps {
  id: keyof typeof PHRASES;
  active: string | null;
  onPick: (id: string, el: HTMLElement) => void;
  toolbarId: string;
  /** Position in the first-view cue; the phrase pulses gently after the switch is circled. */
  cue?: number;
}

/* An inline span (not a <button>) so a phrase wraps with its sentence like real highlighted text;
   role, tabIndex and the key handler give it the same keyboard behaviour as a button. */
const Phrase: FC<PhraseProps> = ({ id, active, onPick, toolbarId, cue }) => (
  <span
    role="button"
    tabIndex={0}
    data-phrase={id}
    aria-expanded={active === id}
    aria-controls={active === id ? toolbarId : undefined}
    onClick={(e) => onPick(id, e.currentTarget)}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onPick(id, e.currentTarget);
      }
    }}
    style={cue !== undefined ? { animationDelay: `${1200 + cue * 260}ms` } : undefined}
    className={cn(
      "cursor-pointer rounded-[2px] px-[1px] transition-colors [box-decoration-break:clone] [-webkit-box-decoration-break:clone]",
      cue !== undefined && "er-pulse",
      active === id
        ? "bg-[rgba(124,58,237,0.24)]"
        : "bg-[rgba(124,58,237,0.1)] underline decoration-[rgba(91,42,214,0.55)] decoration-dotted decoration-[1.5px] underline-offset-[3px] hover:bg-[rgba(124,58,237,0.18)]"
    )}
  >
    {PHRASES[id].text}
  </span>
);

/** The lecture page as uploaded: short, but dense with jargon. */
const OriginalPage: FC<{ phrase?: (id: keyof typeof PHRASES) => ReactNode; compact?: boolean }> = ({ phrase, compact }) => {
  const p = (id: keyof typeof PHRASES) => (phrase ? phrase(id) : PHRASES[id].text);
  return (
    <div
      className={cn(
        "font-[family-name:'Times_New_Roman',Tinos,Times,serif] text-[#1d1d22]",
        compact ? "text-[13.5px] leading-[1.55]" : "text-[15px] leading-[1.6] sm:text-[16px]"
      )}
    >
      <p className="flex justify-between border-b border-[#d8d8dd] pb-1.5 text-[11px] text-[#55555c]">
        <span>MBBS Year 2 · Cardiovascular System</span>
        <span>Lecture 4</span>
      </p>
      <p className={cn("mt-4 font-bold text-[#0e0e10]", compact ? "text-[18px]" : "text-[22px]")}>Heart Sounds</p>
      <p className="mt-3">
        The first heart sound (S1) is produced by closure of the {p("av")} at the onset of ventricular systole. The second
        heart sound (S2) results from closure of the {p("semilunar")} at the end of ventricular ejection.
      </p>
      <p className="mt-3">
        {p("splitting")} of S2 occurs on inspiration, as increased venous return delays pulmonary valve closure. A third
        heart sound (S3) in early diastole reflects rapid ventricular filling and, in older adults, may indicate heart failure.
      </p>
    </div>
  );
};

/** The page as Easy Read really rewrites it (see getTextSimplificationPrompt in the Easy Read
 *  service): the heading kept word for word, each dense sentence broken into two or three short
 *  ones, and every exam term kept in brackets after the plain wording. */
const SIMPLE = [
  "The first heart sound (S1) happens when the valves between the upper and lower chambers snap shut (atrioventricular valves). This happens just as the lower chambers start to squeeze (ventricular systole).",
  "The second heart sound (S2) comes from the exit valves closing (semilunar valves) once the blood has been pushed out (ventricular ejection). Think of S1 as the “lub” and S2 as the “dub”.",
  "When you breathe in (inspiration), S2 can split into two quick sounds. This is normal (physiological splitting): more blood flows back to the heart (increased venous return), so the pulmonary valve closes a moment later.",
  "A third heart sound (S3) can show up early in the heart’s resting phase (early diastole), as blood rushes into the lower chambers (rapid ventricular filling). In older adults, it may be a sign of heart failure.",
];

/** The same page in the Simplified view, typeset like the reader's simplified pages. */
const SimplifiedText: FC<{ compact?: boolean }> = ({ compact }) => (
  <div
    className={cn(
      "font-[family-name:var(--font-sans)] text-[#33333b]",
      compact ? "text-[13.5px] leading-[1.7]" : "text-[15px] leading-[1.75] sm:text-[16px] sm:leading-[1.85]"
    )}
  >
    <p className="text-[1.45em] font-bold leading-[1.25] tracking-[-0.025em] text-[#0b0b0c]">Heart Sounds</p>
    {SIMPLE.map((text) => (
      <p key={text} className="mt-[1em]">
        {text}
      </p>
    ))}
  </div>
);

/** A hand-drawn loop (drawn on a 200×60 grid) scaled to a w×h pixel box. */
const loopPath = (w: number, h: number) => {
  const pts = [
    [112, 3],
    [52, 1], [5, 9], [4, 29],
    [3, 48], [50, 57], [106, 57],
    [163, 57], [198, 48], [197, 29],
    [196, 10], [160, 2], [92, 5],
  ].map(([x, y]) => `${((x * w) / 200).toFixed(1)} ${((y * h) / 60).toFixed(1)}`);
  return `M${pts[0]}C${pts.slice(1, 4).join(" ")}C${pts.slice(4, 7).join(" ")}C${pts.slice(7, 10).join(" ")}C${pts.slice(10, 13).join(" ")}`;
};

/* ---------- the reader ---------- */

const MODES: { value: Mode; label: string; wide?: boolean }[] = [
  { value: "original", label: "Original" },
  { value: "simplified", label: "Simplified" },
  { value: "split", label: "Side by side", wide: true },
];

const PAGE = "rounded-[3px] bg-white shadow-[0_1px_2px_rgba(16,12,40,0.06),0_8px_24px_-12px_rgba(16,12,40,0.18)]";

const EasyReadDemo: FC = () => {
  const [mode, setMode] = useState<Mode>("original");
  const [phrase, setPhrase] = useState<string | null>(null);
  const [action, setAction] = useState<Action | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const [tried, setTried] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLElement | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const focusToolbar = useRef(false);
  const toolbarId = useId();

  /* First-view cue: when the reader first scrolls into view, a hand-drawn circle draws around the
     view switch and the highlighted phrases pulse twice. It plays once, changes nothing, and stops
     as soon as the visitor interacts. Reduced motion hides it (globals.css). */
  const rootRef = useRef<HTMLDivElement>(null);
  const [cue, setCue] = useState<"idle" | "on" | "off">("idle");
  const switchRef = useRef<HTMLDivElement>(null);
  const [loop, setLoop] = useState<{ w: number; h: number; x: number } | null>(null);
  useBrowserLayoutEffect(() => {
    if (cue !== "on" || !switchRef.current) return;
    const r = switchRef.current.getBoundingClientRect();
    const x = window.innerWidth < 640 ? 8 : 16;
    setLoop({ w: Math.round(r.width + x * 2), h: Math.round(r.height + 14), x });
  }, [cue]);
  useEffect(() => {
    if (cue !== "idle" || !rootRef.current) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCue("on");
          io.disconnect();
        }
      },
      { threshold: 0.55 }
    );
    io.observe(rootRef.current);
    return () => io.disconnect();
  }, [cue]);
  useEffect(() => {
    if (cue !== "on") return;
    const t = window.setTimeout(() => setCue("off"), 4800);
    return () => window.clearTimeout(t);
  }, [cue]);
  const stopCue = () => setCue((c) => (c === "on" || c === "idle" ? "off" : c));

  const close = useCallback((returnFocus = false) => {
    setPhrase(null);
    setAction(null);
    if (returnFocus) anchorRef.current?.focus();
  }, []);

  const place = useCallback(() => {
    const page = pageRef.current;
    const el = anchorRef.current;
    if (!page || !el) return;
    const pr = page.getBoundingClientRect();
    const rects = el.getClientRects();
    const last = rects[rects.length - 1] ?? el.getBoundingClientRect();
    const width = Math.min(380, pr.width - 24);
    const left = Math.max(12, Math.min(last.left - pr.left, pr.width - width - 12));
    setPos({ top: last.bottom - pr.top + 8, left, width });
  }, []);

  const pick = (id: string, el: HTMLElement) => {
    stopCue();
    if (phrase === id) return close();
    anchorRef.current = el;
    focusToolbar.current = true;
    setPhrase(id);
    setAction(null);
    setTried(true);
  };

  useBrowserLayoutEffect(() => {
    if (phrase) place();
  }, [phrase, place]);

  // The toolbar renders once its position is known; move focus into it then.
  useEffect(() => {
    if (phrase && pos && focusToolbar.current) {
      focusToolbar.current = false;
      toolbarRef.current?.querySelector("button")?.focus({ preventScroll: true });
    }
  }, [phrase, pos]);

  useEffect(() => {
    if (!phrase) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (toolbarRef.current?.contains(t) || t.closest("[data-phrase]")) return;
      close();
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") close(true);
    };
    window.addEventListener("resize", place);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", place);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [phrase, place, close]);

  useEffect(() => close(), [mode, close]);

  const CUE_ORDER: Record<string, number> = { av: 0, semilunar: 1, splitting: 2 };
  const renderPhrase = (id: keyof typeof PHRASES) => (
    <Phrase id={id} active={phrase} onPick={pick} toolbarId={toolbarId} cue={cue === "on" ? CUE_ORDER[id] : undefined} />
  );

  return (
    <div ref={rootRef} className="overflow-hidden rounded-[20px] border border-[#e3e3e8] bg-white text-left shadow-[0_30px_60px_-36px_rgba(14,14,16,0.35)]">
      {/* reader bar */}
      <div className="flex h-14 items-center gap-3 border-b border-[#ececef] px-3 font-[family-name:var(--font-sans)] sm:grid sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:px-4">
        <span className="hidden min-w-0 items-center gap-1 text-[13.5px] font-semibold text-[#55555c] sm:inline-flex">
          <ChevronLeft size={16} strokeWidth={1.75} aria-hidden className="shrink-0" />
          <span className="truncate">Heart Sounds – Lecture 4</span>
        </span>
        <div ref={switchRef} className="relative flex flex-1 sm:flex-none sm:justify-self-center">
        <div role="group" aria-label="View mode" className="flex flex-1 gap-0.5 rounded-[10px] bg-[#f1f1f3] p-[3px] sm:inline-flex sm:flex-none">
          {MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              aria-pressed={mode === m.value}
              onClick={() => {
                stopCue();
                setMode(m.value);
              }}
              className={cn(
                "h-9 flex-1 whitespace-nowrap rounded-lg px-3.5 text-[13px] font-semibold transition-colors sm:h-8 sm:flex-none",
                m.wide && "hidden lg:block",
                mode === m.value
                  ? "bg-white text-[#0e0e10] shadow-[0_1px_2px_rgba(16,12,40,.1),0_0_0_0.5px_rgba(16,12,40,.06)]"
                  : "text-[#5f5f66] hover:text-[#0e0e10]"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
        {cue === "on" && loop && (
          <svg
            aria-hidden="true"
            className="er-cue pointer-events-none absolute -top-[7px] overflow-visible"
            style={{ left: -loop.x }}
            width={loop.w}
            height={loop.h}
            viewBox={`0 0 ${loop.w} ${loop.h}`}
          >
            <path pathLength="1" d={loopPath(loop.w, loop.h)} fill="none" stroke="#5b2ad6" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
        </div>
        <span className="hidden justify-self-end text-[12.5px] font-medium tabular-nums text-[#6b6b73] sm:block">Page 1 of 3</span>
      </div>

      <div>
        {/* canvas */}
        <div className="relative bg-[#ededf0] px-3 py-4 sm:px-8 sm:py-7 lg:min-h-[652px]">
          {mode === "split" ? (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="mb-2 font-[family-name:var(--font-sans)] text-[12px] font-semibold text-[#55555c]">Original</p>
                <div className={cn(PAGE, "px-7 py-7")}>
                  <OriginalPage compact />
                </div>
              </div>
              <div>
                <p className="mb-2 font-[family-name:var(--font-sans)] text-[12px] font-semibold text-[#55555c]">Simplified</p>
                <div className={cn(PAGE, "px-7 py-7")}>
                  <SimplifiedText compact />
                </div>
              </div>
            </div>
          ) : (
            <div ref={pageRef} className={cn(PAGE, "relative mx-auto max-w-[620px] px-5 pb-9 pt-6 sm:px-11 sm:pb-11 sm:pt-9")}>
              {/* Both versions share one grid cell, so the page keeps the taller one's height and
                  switching views never moves the content below. */}
              <div className="grid [&>*]:[grid-area:1/1]">
                <div className={cn(mode !== "original" && "invisible")} aria-hidden={mode !== "original"}>
                  <OriginalPage phrase={renderPhrase} />
                  <p
                    className={cn(
                      "pointer-events-none mt-6 flex items-center gap-2 font-[family-name:var(--font-sans)] text-[12.5px] font-medium text-[#5b2ad6] transition-opacity",
                      tried && "opacity-0"
                    )}
                  >
                    <Pointer size={15} strokeWidth={1.9} aria-hidden />
                    Tap a highlighted phrase to explain, simplify or define it.
                  </p>
                </div>
                <div className={cn(mode !== "simplified" && "invisible")} aria-hidden={mode !== "simplified"}>
                  <SimplifiedText />
                </div>
              </div>

              {phrase && pos && (
                <div
                  ref={toolbarRef}
                  id={toolbarId}
                  className="absolute z-10 font-[family-name:var(--font-sans)]"
                  style={{ top: pos.top, left: pos.left, width: pos.width }}
                >
                  <div
                    role="toolbar"
                    aria-label={`Explain, simplify or define “${PHRASES[phrase].text}”`}
                    className="inline-flex gap-0.5 rounded-[10px] bg-[#141416] p-1 shadow-[0_10px_24px_-10px_rgba(14,14,16,0.5)]"
                  >
                    {ACTIONS.map(({ label, Icon }) => (
                      <button
                        key={label}
                        type="button"
                        aria-pressed={action === label}
                        onClick={() => setAction(label)}
                        className={cn(
                          "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[12.5px] font-semibold text-white transition-colors",
                          action === label ? "bg-[var(--hp)]" : "hover:bg-white/10"
                        )}
                      >
                        <Icon size={13} strokeWidth={1.9} className={action === label ? "text-white" : "text-[#c4b5fd]"} aria-hidden />
                        {label}
                      </button>
                    ))}
                  </div>
                  <div aria-live="polite">
                    {action && (
                      <div className="mt-2 rounded-[14px] border border-[#e6e3f0] bg-white p-4 shadow-[0_18px_40px_-20px_rgba(14,14,16,0.45)]">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-[12px] font-semibold text-[var(--hp)]">
                            {action} · <span className="text-[#55555c]">{PHRASES[phrase].text}</span>
                          </p>
                          <button
                            type="button"
                            onClick={() => close(true)}
                            aria-label="Close"
                            className="-mr-1 -mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-md text-[#6b6b73] hover:bg-[#f1f1f3] hover:text-[#0e0e10]"
                          >
                            <X size={15} strokeWidth={1.9} aria-hidden />
                          </button>
                        </div>
                        <p className="mt-1.5 text-[14px] leading-[1.6] text-[#26262b]">{PHRASES[phrase].answers[action]}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default EasyReadDemo;
