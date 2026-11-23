import React, { FC, ReactNode } from "react";
import Link from "next/link";
import cn from "classnames";
import { Check, X } from "lucide-react";

interface Step {
  label: string;
  /** Where a finished step leads back to, if it can be revisited. */
  href?: string;
}

interface Props {
  /** 1 Template · 2 Write · 3 Review and send */
  current: 1 | 2 | 3;
  campaignId?: string;
  /** Template can be changed while the campaign is a draft. */
  canChangeTemplate?: boolean;
  actions?: ReactNode;
}

/** The campaign steps' top bar: Close, where you are, and the next action. */
const WizardHeader: FC<Props> = ({ current, campaignId, canChangeTemplate = false, actions }) => {
  const steps: Step[] = [
    {
      label: "Template",
      href: campaignId && canChangeTemplate ? `/admin/campaigns/new?campaign=${campaignId}` : undefined,
    },
    { label: "Write", href: campaignId ? `/admin/campaigns/${campaignId}/edit` : undefined },
    { label: "Review and send" },
  ];

  return (
    <header className="sticky top-0 z-30 flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-line bg-surface px-4 py-3 md:px-7 md:py-3.5">
      <Link
        href="/admin/campaigns"
        className="inline-flex h-10 items-center gap-2 rounded-[10px] pl-2 pr-3 text-sm font-semibold text-body transition-colors hover:bg-hover hover:text-ink"
      >
        <X size={18} strokeWidth={1.8} aria-hidden="true" />
        Close
      </Link>
      <ol
        aria-label="Steps"
        className="order-last flex w-full flex-wrap gap-x-[22px] gap-y-2 text-sm md:order-none md:mx-auto md:w-auto"
      >
        {steps.map((step, i) => {
          const n = (i + 1) as 1 | 2 | 3;
          const done = n < current;
          const here = n === current;
          const badge = (
            <span
              aria-hidden="true"
              className={cn(
                "grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs",
                done && "bg-success text-on-success",
                here && "bg-ink text-surface",
                !done && !here && "border-[1.5px] border-control text-subtle"
              )}
            >
              {done ? <Check size={13} strokeWidth={3} /> : n}
            </span>
          );
          const label = (
            <>
              {done && <span className="sr-only">Done: </span>}
              {step.label}
            </>
          );
          return (
            <li
              key={step.label}
              aria-current={here ? "step" : undefined}
              className={cn(
                "inline-flex items-center gap-2",
                here ? "font-bold text-ink" : done ? "font-semibold text-body" : "font-medium text-subtle"
              )}
            >
              {badge}
              {done && step.href ? (
                <Link href={step.href} className="rounded hover:text-accent hover:underline">
                  {label}
                </Link>
              ) : (
                <span>{label}</span>
              )}
            </li>
          );
        })}
      </ol>
      <div className="ml-auto flex flex-wrap items-center gap-2.5 md:ml-0">{actions}</div>
    </header>
  );
};

export default WizardHeader;
