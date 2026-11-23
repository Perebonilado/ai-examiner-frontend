import React, { FC, useEffect, useMemo, useRef, useState } from "react";
import cn from "classnames";
import { Check, ChevronsLeft } from "lucide-react";
import { useGetCoverageQuery, useGetLabelBatchesQuery, useStartLabellingMutation } from "@/api-services/admin.service";
import { Coverage, LabelBatch, LabelKind } from "@/models/insights.model";
import { ConfirmDialog } from "../AdminDialog";
import { formatNumber, relativeTime } from "../format";
import { Card, Chip, ErrorState, LoadingBlock, ProgressBar, buttonClass } from "../ui";

const KINDS: { key: LabelKind; label: string }[] = [
  { key: "chat", label: "Chats" },
  { key: "test", label: "Tests" },
  { key: "document", label: "Documents" },
];

const money = (v: number) => (v < 10 ? `$${v.toFixed(2)}` : `$${Math.round(v).toLocaleString("en-GB")}`);
const monthName = (m: string, withYear = false) =>
  new Intl.DateTimeFormat("en-GB", { month: "short", ...(withYear ? { year: "numeric" } : {}), timeZone: "UTC" }).format(
    new Date(`${m}-15T12:00:00Z`)
  );
const lastDay = (m: string) => {
  const d = new Date(`${m}-01T12:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + 1, 0);
  return d.toISOString().slice(0, 10);
};

type Row = Coverage["months"][number];
const sum = (row: Row, kinds: LabelKind[], f: "total" | "done" | "pending" | "failed") =>
  kinds.reduce((a, k) => a + row[k][f], 0);
/** Items Claude hasn't read and isn't reading now. */
const left = (row: Row, kinds: LabelKind[]) => kinds.reduce((a, k) => a + Math.max(0, row[k].total - row[k].done - row[k].pending), 0);

/** How much of each month Claude has read, and the controls to read further back. */
export const CoveragePanel: FC = () => {
  const { data: batches } = useGetLabelBatchesQuery(undefined, { pollingInterval: 30_000 });
  const inFlight = (batches ?? []).filter((b) => b.status === "submitted" || b.status === "importing");
  const { data, isLoading, isError, refetch } = useGetCoverageQuery(undefined, { pollingInterval: inFlight.length ? 30_000 : 0 });
  const [kinds, setKinds] = useState<LabelKind[]>(["chat", "test", "document"]);
  const [pick, setPick] = useState<{ from: string; to: string } | null>(null);
  const [anchor, setAnchor] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [start, { isLoading: starting }] = useStartLabellingMutation();
  const [started, setStarted] = useState<string | null>(null);

  const months = useMemo(() => data?.months ?? [], [data]);
  // The newest months matter most: start the strip scrolled to the end.
  const strip = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = strip.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [months.length]);
  const totals = useMemo(() => {
    const all = KINDS.map((k) => k.key);
    return months.reduce(
      (a, r) => ({ total: a.total + sum(r, all, "total"), done: a.done + sum(r, all, "done"), pending: a.pending + sum(r, all, "pending") }),
      { total: 0, done: 0, pending: 0 }
    );
  }, [months]);

  /** The months just before the earliest fully read one: what "keep going back" picks. */
  const goBack = useMemo(() => {
    const all = KINDS.map((k) => k.key);
    let i = months.length - 1;
    while (i >= 0 && left(months[i], all) === 0) i--;
    if (i < 0) return null;
    const to = months[i].month;
    const from = months[Math.max(0, i - 2)].month;
    return { from, to };
  }, [months]);

  const selected = (m: string) => !!pick && m >= pick.from && m <= pick.to;
  const chosen = months.filter((r) => selected(r.month));
  const items = chosen.reduce((a, r) => a + left(r, kinds), 0);
  const dollars = data ? chosen.reduce((a, r) => a + kinds.reduce((b, k) => b + Math.max(0, r[k].total - r[k].done - r[k].pending) * data.costPerItem[k], 0), 0) : 0;

  const onMonth = (m: string) => {
    if (!anchor || !pick || pick.from !== pick.to) {
      setAnchor(m);
      setPick({ from: m, to: m });
    } else {
      setPick(m < anchor ? { from: m, to: anchor } : { from: anchor, to: m });
      setAnchor(null);
    }
    setStarted(null);
  };

  const run = async () => {
    if (!pick) return;
    const res = await start({ kinds, from: `${pick.from}-01`, to: lastDay(pick.to) });
    setConfirm(false);
    if ("data" in res && res.data) {
      setStarted(`Sent ${formatNumber(res.data.items)} items to Claude. Results arrive within a few hours, usually much sooner.`);
      setPick(null);
    }
  };

  return (
    <Card className="flex flex-col gap-4 p-4 md:p-5" labelledBy="labelling-title">
      <div id="labelling" className="flex flex-wrap items-start gap-x-4 gap-y-2">
        <div className="mr-auto flex min-w-0 flex-col gap-0.5">
          <h2 id="labelling-title" className="text-[15px] font-bold text-ink">
            What Claude has read
          </h2>
          <p className="text-[13px] text-subtle">
            {data
              ? `${formatNumber(totals.done)} of ${formatNumber(totals.total)} chats, tests and documents since ${monthName(months[0]?.month ?? "2024-05", true)} · ${money(data.spent)} spent so far`
              : " "}
          </p>
        </div>
        {goBack && (
          <button type="button" className={buttonClass.small} onClick={() => { setPick(goBack); setAnchor(null); setStarted(null); }}>
            <ChevronsLeft size={15} aria-hidden="true" />
            Keep going back
          </button>
        )}
      </div>

      {isLoading ? (
        <LoadingBlock label="Loading coverage" className="py-8" />
      ) : !data ? (
        isError ? <ErrorState onRetry={refetch} /> : null
      ) : (
        <>
          <div ref={strip} className="-mx-4 overflow-x-auto px-4 pb-1 md:-mx-5 md:px-5" role="group" aria-label="Months: pick one, or two to choose the months between">
            <ol className="grid auto-cols-[minmax(38px,1fr)] grid-flow-col gap-0.5">
              {months.map((r, i) => {
                const total = sum(r, kinds, "total");
                const done = sum(r, kinds, "done");
                const pending = sum(r, kinds, "pending");
                const share = total ? done / total : 1;
                const on = selected(r.month);
                const newYear = i === 0 || r.month.endsWith("-01");
                return (
                  <li key={r.month} className="flex flex-col gap-1">
                    <span className={cn("h-4 font-mono text-[10.5px] text-muted", !newYear && "invisible")}>{r.month.slice(0, 4)}</span>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => onMonth(r.month)}
                      title={`${monthName(r.month, true)}: ${formatNumber(done)} of ${formatNumber(total)} read${pending ? `, ${formatNumber(pending)} with Claude now` : ""}`}
                      className={cn(
                        "group flex w-full flex-col items-center gap-1.5 rounded-[10px] border px-0.5 pb-1.5 pt-2 transition-colors",
                        on ? "border-ink bg-well" : "border-transparent hover:border-line hover:bg-canvas"
                      )}
                    >
                      <span className="relative h-14 w-3 overflow-hidden rounded-full bg-hover" aria-hidden="true">
                        <span
                          className="absolute inset-x-0 bottom-0 rounded-full bg-[var(--viz-primary)] transition-[height] duration-500"
                          style={{ height: `${total ? Math.max(share > 0 ? 8 : 0, share * 100) : 0}%` }}
                        />
                        {pending > 0 && (
                          <span
                            className="absolute inset-x-0 animate-pulse bg-[var(--seq-3)] motion-reduce:animate-none"
                            style={{ bottom: `${share * 100}%`, height: `${Math.max(6, (pending / Math.max(1, total)) * 100)}%` }}
                          />
                        )}
                      </span>
                      <span className="text-[11.5px] font-semibold text-ink">{monthName(r.month)}</span>
                      <span className="font-mono text-[10px] text-muted tabular-nums">{total ? `${Math.round(share * 100)}%` : "–"}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="flex flex-col gap-3 rounded-xl bg-well p-3 md:flex-row md:items-center">
            <div role="group" aria-label="What to read" className="flex flex-wrap gap-1.5">
              {KINDS.map((k) => {
                const on = kinds.includes(k.key);
                return (
                  <button
                    key={k.key}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setKinds((ks) => (on ? (ks.length > 1 ? ks.filter((x) => x !== k.key) : ks) : [...ks, k.key]))}
                    className={cn(
                      "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12.5px] font-semibold transition-colors",
                      on ? "border-ink bg-ink text-surface" : "border-line bg-surface text-body hover:border-control"
                    )}
                  >
                    {on && <Check size={13} strokeWidth={2.6} aria-hidden="true" />}
                    {k.label}
                  </button>
                );
              })}
            </div>
            <p className="min-w-0 flex-1 text-[13px] text-body md:text-right" aria-live="polite">
              {started ? (
                <span className="font-semibold text-success">{started}</span>
              ) : !pick ? (
                "Pick a month, or two months to take everything between."
              ) : items === 0 ? (
                <>
                  Claude has already read {pick.from === pick.to ? monthName(pick.from, true) : `${monthName(pick.from, true)} – ${monthName(pick.to, true)}`}.
                </>
              ) : (
                <>
                  <b className="font-semibold text-ink">{formatNumber(items)}</b> unread in{" "}
                  {pick.from === pick.to ? monthName(pick.from, true) : `${monthName(pick.from, true)} – ${monthName(pick.to, true)}`} · about{" "}
                  <b className="font-semibold text-ink">{money(dollars)}</b>
                </>
              )}
            </p>
            <button type="button" disabled={!pick || items === 0 || starting} onClick={() => setConfirm(true)} className={cn(buttonClass.primary, "h-9")}>
              {items > 0 ? `Label ${formatNumber(items)}` : "Label"}
            </button>
          </div>

          {batches && batches.length > 0 && <Batches batches={batches} />}
        </>
      )}

      <ConfirmDialog
        open={confirm}
        title={`Send ${formatNumber(items)} items to Claude?`}
        message={
          <>
            Claude Opus 5.5 reads them in the background at batch prices, about <b>{money(dollars)}</b> in all. Results usually land within an hour. Nothing
            is shown to students.
          </>
        }
        confirmLabel={`Label ${formatNumber(items)}`}
        busy={starting}
        onConfirm={run}
        onClose={() => setConfirm(false)}
      />
    </Card>
  );
};

const STATUS: Record<LabelBatch["status"], { label: string; tone: "violet" | "green" | "grey" | "coral" }> = {
  submitted: { label: "With Claude", tone: "violet" },
  importing: { label: "Saving", tone: "violet" },
  imported: { label: "Done", tone: "green" },
  failed: { label: "Failed", tone: "coral" },
};

const Batches: FC<{ batches: LabelBatch[] }> = ({ batches }) => {
  const [all, setAll] = useState(false);
  const shown = all ? batches : batches.slice(0, 4);
  return (
    <div className="flex flex-col gap-1 border-t border-line pt-3">
      <h3 className="text-[13px] font-bold text-ink">Recent runs</h3>
      <ul className="flex flex-col divide-y divide-line">
        {shown.map((b) => {
          const s = STATUS[b.status] ?? STATUS.submitted;
          const progress = b.items ? ((b.done + b.failed) / b.items) * 100 : 0;
          return (
            <li key={b.id} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 py-2.5 md:grid-cols-[minmax(0,1fr)_160px_90px_90px]">
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-[13px] font-semibold text-ink">
                  {b.purpose === "drafts" ? "Follow-up drafts" : b.note ?? "Labels"}
                </span>
                <span className="text-[11.5px] text-muted">
                  {formatNumber(b.items)} items · sent {relativeTime(b.submittedOn).toLowerCase()}
                  {b.failed ? ` · ${formatNumber(b.failed)} couldn’t be read` : ""}
                </span>
              </div>
              <Chip tone={s.tone} className="justify-self-end md:hidden">
                {s.label}
              </Chip>
              <div className="col-span-2 flex items-center gap-2 md:col-span-1">
                <ProgressBar pct={b.status === "imported" ? 100 : progress} className="flex-1" height={6} />
                <span className="w-9 text-right font-mono text-[11px] text-muted tabular-nums">{Math.round(b.status === "imported" ? 100 : progress)}%</span>
              </div>
              <span className="hidden justify-self-end md:block">
                <Chip tone={s.tone}>{s.label}</Chip>
              </span>
              <span className="hidden text-right font-mono text-[12px] text-body tabular-nums md:block">{b.cost ? money(b.cost) : "–"}</span>
            </li>
          );
        })}
      </ul>
      {batches.length > 4 && (
        <button type="button" onClick={() => setAll((a) => !a)} className={cn(buttonClass.link, "self-start text-[13px]")}>
          {all ? "Show fewer" : `Show all ${batches.length}`}
        </button>
      )}
    </div>
  );
};
