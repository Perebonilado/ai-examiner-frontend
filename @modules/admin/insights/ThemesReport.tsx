import React, { FC, useEffect, useState } from "react";
import cn from "classnames";
import { Check, RefreshCw } from "lucide-react";
import { useGetDigestQuery, useWriteDigestMutation } from "@/api-services/admin.service";
import { DayRange } from "@/models/admin.model";
import { LabelKind } from "@/models/insights.model";
import { formatNumber, relativeTime } from "../format";
import { rangePhrase } from "../range";
import { Card, Chip, buttonClass } from "../ui";
import { Quote } from "./insightsUi";

const KIND_TITLE: Record<LabelKind, string> = { chat: "In chat", test: "In tests", document: "In uploads" };

/** Claude's written read of the period: the main themes, each with a quote and a fix. */
export const ThemesReport: FC<{ range: DayRange; today: string }> = ({ range, today }) => {
  const [poll, setPoll] = useState(0);
  const { data, isLoading, refetch } = useGetDigestQuery(range, { pollingInterval: poll });
  const [write, { isLoading: writing }] = useWriteDigestMutation();
  const running = !!data?.running || writing;
  const digest = data?.digest ?? null;

  useEffect(() => setPoll(running ? 4000 : 0), [running]);

  const start = async () => {
    await write(range);
    refetch();
  };

  const sections = (digest?.sections ?? []).filter((s) => s.themes.length > 0);

  return (
    <Card className="flex flex-col gap-4 p-4 md:p-5" labelledBy="themes-title">
      <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
        <div className="mr-auto flex min-w-0 flex-col gap-0.5">
          <h2 id="themes-title" className="flex flex-wrap items-center gap-2 text-[15px] font-bold text-ink">
            Themes
            {digest?.stale && !running && <Chip tone="amber">New labels since this was written</Chip>}
          </h2>
          <p className="text-[13px] text-subtle">
            {running
              ? "Claude is reading every label and writing the report. This takes a minute or two."
              : digest
              ? `Claude’s read of ${formatNumber(digest.labelCount)} labels ${rangePhrase(range, today)} · written ${relativeTime(digest.createdOn).toLowerCase()}`
              : `What students struggle with ${rangePhrase(range, today)}, in Claude’s words`}
          </p>
        </div>
        {!isLoading && (
          <button type="button" onClick={start} disabled={running} className={buttonClass.small}>
            <RefreshCw size={14} aria-hidden="true" className={cn(running && "animate-spin motion-reduce:animate-none")} />
            {running ? "Writing" : digest ? "Rewrite" : "Write the report"}
          </button>
        )}
      </div>

      {running && !digest ? (
        <div aria-hidden="true" className="flex flex-col gap-2.5">
          {[92, 70, 84, 60].map((w, i) => (
            <span key={i} className="h-3.5 animate-pulse rounded-full bg-hover motion-reduce:animate-none" style={{ width: `${w}%` }} />
          ))}
        </div>
      ) : !digest ? (
        !isLoading && (
          <p className="rounded-xl bg-well px-4 py-5 text-[13.5px] leading-relaxed text-body">
            No report for these dates yet. Claude reads up to 700 labels from the period and writes up the main themes, each with a real quote and something to
            fix. One report costs about $0.25.
          </p>
        )
      ) : (
        <div className={cn("flex flex-col gap-5 transition-opacity", running && "opacity-50")}>
          {digest.headline && <p className="max-w-[72ch] text-[17px] font-semibold leading-snug tracking-[-0.01em] text-ink">{digest.headline}</p>}
          <div className={cn("grid grid-cols-1 gap-x-6 gap-y-5", sections.length > 1 && "lg:grid-cols-2", sections.length > 2 && "2xl:grid-cols-3")}>
            {sections.map((s) => (
              <section key={s.kind} className="flex min-w-0 flex-col gap-3">
                <h3 className="text-[13px] font-bold text-subtle">{KIND_TITLE[s.kind] ?? s.kind}</h3>
                <ol className="flex flex-col gap-4">
                  {s.themes.map((t, i) => (
                    <li key={i} className="flex flex-col gap-2">
                      <p className="flex items-baseline gap-2 text-[14px] font-semibold leading-snug text-ink">
                        <span className="mr-auto">{t.title}</span>
                        <span className="shrink-0 font-mono text-[11.5px] font-medium text-muted tabular-nums">{formatNumber(t.count)}</span>
                      </p>
                      {t.quote && <Quote>“{t.quote}”</Quote>}
                      {t.fix && (
                        <p className="text-[13px] leading-snug text-body">
                          <b className="font-semibold text-ink">Fix: </b>
                          {t.fix}
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>
          {digest.brightSpots.length > 0 && (
            <div className="flex flex-col gap-2 border-t border-line pt-4">
              <h3 className="text-[13px] font-bold text-subtle">Going well</h3>
              <ul className="flex flex-col gap-1.5">
                {digest.brightSpots.map((b, i) => (
                  <li key={i} className="flex gap-2 text-[13.5px] leading-snug text-body">
                    <Check size={15} strokeWidth={2.4} aria-hidden="true" className="mt-0.5 shrink-0 text-success" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
