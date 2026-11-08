import React, { FC } from "react";
import cn from "classnames";
import { useRouter } from "next/router";
import { Clock, X } from "lucide-react";
import Button from "@/@shared/ui/Button";
import { formatClock } from "./useEasyReadTimer";

const FREE_MINUTES = 10;

/** Shown when a free-plan user opens Easy Read: the monthly allowance and what's left. */
export const EasyReadAllowanceBanner: FC<{
  remaining: number;
  onDismiss: () => void;
}> = ({ remaining, onDismiss }) => {
  const router = useRouter();
  return (
    <div
      role="status"
      className="flex shrink-0 items-center gap-3 border-b border-line bg-surface px-5 py-2.5 text-[13px] text-body max-md:px-3 max-md:py-2"
    >
      <Clock size={16} strokeWidth={1.75} className="shrink-0 text-accent" aria-hidden="true" />
      <p className="min-w-0 flex-1 leading-snug">
        <span className="font-semibold text-ink">Free plan:</span> {FREE_MINUTES} minutes of Easy
        Read a month.{" "}
        <span className="font-semibold tabular-nums text-ink">{formatClock(remaining)}</span> left
        this month.
      </p>
      <button
        type="button"
        onClick={() => router.push("/pricing")}
        className="shrink-0 text-[13px] font-semibold text-accent transition-colors hover:text-accent-900"
      >
        Upgrade
      </button>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="-mr-1.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-subtle transition-colors hover:bg-hover hover:text-ink"
      >
        <X size={16} strokeWidth={1.75} aria-hidden="true" />
      </button>
    </div>
  );
};

/** Free time left this month, as a small pill (amber in the last two minutes). */
export const EasyReadTimePill: FC<{ remaining: number; className?: string }> = ({
  remaining,
  className,
}) => {
  const low = remaining <= 120;
  return (
    <span
      role="timer"
      aria-label={`${formatClock(remaining)} of free Easy Read left this month`}
      title="Free plan: 10 minutes of Easy Read a month"
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-[12.5px] font-semibold tabular-nums",
        low
          ? "border-warning-line bg-warning-bg text-warning"
          : "border-line bg-surface text-subtle",
        className
      )}
    >
      <Clock size={14} strokeWidth={1.75} aria-hidden="true" />
      {formatClock(remaining)} left
    </span>
  );
};

const formatResetDate = (iso: string | null | undefined) => {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { month: "long", day: "numeric", timeZone: "UTC" });
};

/** The free minutes are used up: upgrade, or leave. Not dismissible by clicking outside. */
export const EasyReadLimitDialog: FC<{
  resetsOn?: string | null;
  /** Reader: "Back to document". Elsewhere: "Not now". */
  secondaryLabel: string;
  onSecondary: () => void;
}> = ({ resetsOn, secondaryLabel, onSecondary }) => {
  const router = useRouter();
  const resetDate = formatResetDate(resetsOn);
  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="easy-read-limit-title"
      aria-describedby="easy-read-limit-body"
      className="w-[min(420px,calc(100vw-32px))] rounded-2xl border border-edge bg-surface p-6 text-center shadow-pop"
    >
      <span className="mx-auto mb-4 grid h-[52px] w-[52px] place-items-center rounded-full bg-warning-bg text-warning">
        <Clock size={22} strokeWidth={1.75} aria-hidden="true" />
      </span>
      <h2
        id="easy-read-limit-title"
        className="text-xl font-bold tracking-[-0.02em] text-ink [text-wrap:balance]"
      >
        You&apos;ve used your {FREE_MINUTES} free minutes
      </h2>
      <p
        id="easy-read-limit-body"
        className="mt-1.5 text-[15px] leading-normal text-subtle [text-wrap:balance]"
      >
        The free plan includes {FREE_MINUTES} minutes of Easy Read each month. Upgrade to keep
        reading{resetDate ? `, or come back on ${resetDate}` : ""}.
      </p>
      <div className="mt-6 flex flex-col gap-2.5">
        <Button title="Upgrade plan" size="large" fullWidth onClick={() => router.push("/pricing")} />
        <Button
          title={secondaryLabel}
          variant="outlined"
          size="large"
          fullWidth
          onClick={onSecondary}
        />
      </div>
    </div>
  );
};
