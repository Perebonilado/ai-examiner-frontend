import React, { ElementRef, useEffect, useRef, useState } from "react";
import cn from "classnames";
import { ChevronLeft, ChevronRight, Timer } from "lucide-react";

interface CountdownProps {
  timeLeft?: number | null; // Time in seconds
  totalDuration?: number | null; // Optional total duration for progress calculation
  answered?: number;
  total?: number;
}

/**
 * Test progress pill: answered count + time left, collapsible to a single button.
 * Fixed under the top bar on desktop, above the bottom action bar on phones.
 * The countdown itself (ticking, auto-submit) lives in the test containers.
 */
const CountdownTimer: React.FC<CountdownProps> = ({
  timeLeft,
  totalDuration,
  answered = 0,
  total = 0,
}) => {
  const [progress, setProgress] = useState(100);
  const hasTimer = typeof timeLeft === "number" && timeLeft > 0;

  // Calculate minutes and seconds
  const minutes = hasTimer ? Math.floor((timeLeft as number) / 60) : 0;
  const seconds = hasTimer ? (timeLeft as number) % 60 : 0;

  // Format time as mm:ss
  const timeString = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  useEffect(() => {
    if (!hasTimer) return;
    // Calculate progress percentage
    const duration = totalDuration || (timeLeft as number);
    const progressPercentage = ((timeLeft as number) / duration) * 100;
    setProgress(progressPercentage);
  }, [timeLeft, totalDuration]);

  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    if (progress === 20 && isHidden) {
      setIsHidden(false);
    }
  }, [progress, isHidden]);

  // On desktop the pill floats at the viewport's top right. When the sidebar is open and the
  // window is narrow it would sit over the test header's ⋯ button, so the header makes room.
  const pillRef = useRef<ElementRef<"div">>(null);
  useEffect(() => {
    const pill = pillRef.current;
    if (!pill) return;
    const fit = () => {
      const head = document.querySelector<HTMLElement>("[data-test-head]");
      if (!head) return;
      if (window.innerWidth < 768) {
        head.style.paddingRight = "";
        return;
      }
      const column = (head.parentElement || head).getBoundingClientRect();
      const overlap = column.right - pill.getBoundingClientRect().left + 12;
      head.style.paddingRight = overlap > 0 ? `${Math.ceil(overlap)}px` : "";
    };
    fit();
    const observer =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(fit) : null;
    observer?.observe(pill);
    // the sidebar opening or closing resizes <main> without a window resize
    const main = document.querySelector("[data-test-head]")?.closest("main");
    if (main) observer?.observe(main);
    window.addEventListener("resize", fit);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", fit);
      const head = document.querySelector<HTMLElement>("[data-test-head]");
      if (head) head.style.paddingRight = "";
    };
  }, []);

  const isLow = hasTimer && progress < 20;
  const answeredWidth = total > 0 ? Math.min(100, (answered / total) * 100) : 0;
  const statusLabel = `${answered} of ${total} answered${
    hasTimer ? `, ${timeString} left` : ""
  }`;

  return (
    <div
      ref={pillRef}
      data-phone-pill=""
      role="status"
      aria-label={statusLabel}
      className={cn(
        "fixed z-[25] inline-flex items-center rounded-full border border-line bg-white/95 backdrop-blur-md shadow-soft",
        "text-[13px] text-subtle tabular-nums",
        "right-3 bottom-[calc(92px+env(safe-area-inset-bottom))] h-[38px]",
        "md:right-6 md:top-[74px] md:bottom-auto md:h-10",
        isHidden ? "gap-0 px-1" : "gap-2.5 pl-[9px] pr-1"
      )}
    >
      {!isHidden && (
        <>
          <span
            aria-hidden="true"
            className="w-11 h-[5px] rounded-full bg-sunken overflow-hidden shrink-0"
          >
            <span
              className="block h-full rounded-full bg-accent transition-[width] duration-300"
              style={{ width: `${answeredWidth}%` }}
            />
          </span>
          <span className="whitespace-nowrap">
            <b className="text-ink font-bold">{answered}</b>/{total} answered
          </span>
          {hasTimer && (
            <>
              <span aria-hidden="true" className="w-px h-4 bg-line" />
              <span
                className={cn(
                  "inline-flex items-center gap-[5px] font-semibold",
                  isLow ? "text-danger" : "text-ink"
                )}
              >
                <Timer
                  size={14}
                  strokeWidth={1.75}
                  className={isLow ? "text-danger" : "text-muted"}
                />
                {timeString}
              </span>
            </>
          )}
        </>
      )}
      <button
        type="button"
        onClick={() => {
          setIsHidden(!isHidden);
        }}
        aria-label={isHidden ? "Show test progress" : "Hide test progress"}
        title={isHidden ? "Show progress" : "Hide progress"}
        className="w-[30px] h-[30px] rounded-full grid place-items-center text-faint hover:bg-hover hover:text-ink transition-colors"
      >
        {isHidden ? (
          <ChevronLeft size={16} strokeWidth={1.75} />
        ) : (
          <ChevronRight size={16} strokeWidth={1.75} />
        )}
      </button>
    </div>
  );
};

export default CountdownTimer;
