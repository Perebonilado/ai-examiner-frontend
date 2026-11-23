import React, { FC, ReactNode } from "react";
import cn from "classnames";
import { useGetBehaviourQuery, useGetStudentTimelineQuery } from "@/api-services/admin.service";
import { DayRange } from "@/models/admin.model";
import { BehaviourReport, WaitStat } from "@/models/insights.model";
import { formatDayAndTime, formatNumber, formatTime } from "../format";
import { Funnel } from "../charts/Panels";
import { Card, LoadingBlock } from "../ui";
import { describe, duration, pageName } from "./behaviourText";

const Block: FC<{ title: string; children: ReactNode; className?: string }> = ({ title, children, className }) => (
  <div className={cn("flex min-w-0 flex-col gap-2.5", className)}>
    <h3 className="text-[13px] font-bold text-subtle">{title}</h3>
    {children}
  </div>
);

const Wait: FC<{ label: string; w: WaitStat; slowAfterMs: number }> = ({ label, w, slowAfterMs }) => (
  <div className="flex flex-col gap-0.5">
    <dt className="text-[12px] text-muted">{label}</dt>
    <dd className="flex items-baseline gap-2">
      <span className={cn("text-[18px] font-semibold tabular-nums", (w.p50 ?? 0) > slowAfterMs ? "text-danger" : "text-ink")}>{duration(w.p50)}</span>
      <span className="text-[12px] text-subtle tabular-nums">{w.count ? `slowest 10%: ${duration(w.p90)}` : "no data yet"}</span>
    </dd>
  </div>
);

const Row: FC<{ label: ReactNode; value: ReactNode; bad?: boolean }> = ({ label, value, bad }) => (
  <li className="flex items-baseline gap-3 py-1.5 text-[13px]">
    <span className="min-w-0 flex-1 text-body">{label}</span>
    <b className={cn("shrink-0 font-semibold tabular-nums", bad ? "text-danger" : "text-ink")}>{value}</b>
  </li>
);

const TEST_NAMES: Record<string, string> = {
  "multiple-choice": "Multiple choice",
  "multiple-true-false": "True/false",
  "flash-cards": "Flashcards",
  essay: "Essay",
  viva: "Oral viva",
  unknown: "Type not recorded",
};
const SIGN_UP: Record<string, string> = { email: "email", guest: "as a guest", guest_upgrade: "guest made an account", google: "Google" };

const people = (n: number) => `${formatNumber(n)} ${n === 1 ? "student" : "students"}`;

const Body: FC<{ r: BehaviourReport }> = ({ r }) => {
  const f = r.failures;
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <Block title="From the upload page to a finished test">
          <Funnel steps={r.steps} />
        </Block>
        <Block title="How long students wait (median)">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
            <Wait label="Upload and reading the file" w={r.waits.upload} slowAfterMs={30_000} />
            <Wait label="Making a test" w={r.waits.testGeneration} slowAfterMs={45_000} />
            <Wait label="First words of a chat answer" w={r.waits.chatFirstWords} slowAfterMs={8_000} />
            <Wait label="Whole chat answer" w={r.waits.chatWholeReply} slowAfterMs={40_000} />
          </dl>
        </Block>
      </div>

      <div className="grid grid-cols-1 gap-6 border-t border-line pt-5 lg:grid-cols-3">
        <Block title="What goes wrong">
          <ul className="flex flex-col divide-y divide-line">
            <Row label="Uploads that failed" value={people(f.uploads.people)} bad={f.uploads.count > 0} />
            <Row label="Tests that couldn’t be made" value={people(f.testGeneration.people)} bad={f.testGeneration.count > 0} />
            <Row label="Chat answers that failed" value={people(f.chat.people)} bad={f.chat.count > 0} />
            <Row label="Chat answers stopped by the student" value={formatNumber(f.chatStopped.count)} />
            <Row label="Essays submitted with nothing written" value={formatNumber(f.blankEssays.count)} bad={f.blankEssays.count > 0} />
            <Row
              label={
                <>
                  Tests left part-way
                  {f.testsLeft.averageShareAnswered !== null && (
                    <span className="text-muted"> · {f.testsLeft.averageShareAnswered}% answered on average</span>
                  )}
                </>
              }
              value={formatNumber(f.testsLeft.count)}
            />
          </ul>
        </Block>
        <Block title="Limits and paying">
          <ul className="flex flex-col divide-y divide-line">
            {r.limits.map((l) => (
              <Row key={l.which} label={`Hit the ${l.which.replace(/_/g, " ")} limit`} value={people(l.people)} />
            ))}
            <Row label="Saw an upgrade prompt" value={people(f.upgradeShown.people)} />
            <Row label="Started paying" value={people(f.checkoutStarted.people)} />
            <Row label="Payment confirmed" value={people(f.checkoutFinished.people)} />
            <Row label="Payment not confirmed" value={people(f.checkoutNotConfirmed.people)} bad={f.checkoutNotConfirmed.people > 0} />
            {r.upgradePrompts.length > 0 && (
              <li className="flex flex-col gap-1 py-2">
                <span className="text-[12px] text-muted">Prompts shown</span>
                {r.upgradePrompts.slice(0, 4).map((p) => (
                  <span key={p.prompt} className="flex items-baseline gap-3 text-[12.5px]">
                    <span className="min-w-0 flex-1 truncate text-body">“{p.prompt}”</span>
                    <b className="shrink-0 font-semibold text-ink tabular-nums">{formatNumber(p.count)}</b>
                  </span>
                ))}
              </li>
            )}
          </ul>
        </Block>
        <Block title="Where visits end">
          <ul className="flex flex-col divide-y divide-line">
            {r.exitPages.length === 0 && <li className="py-1.5 text-[13px] text-muted">Nothing yet.</li>}
            {r.exitPages.slice(0, 6).map((p) => (
              <Row key={p.path} label={pageName(p.path)} value={formatNumber(p.sessions)} />
            ))}
          </ul>
        </Block>
      </div>

      <div className="grid grid-cols-1 gap-6 border-t border-line pt-5 lg:grid-cols-3">
        <Block title="Tests by type (students)">
          {r.tests.length === 0 ? (
            <p className="py-1.5 text-[13px] text-muted">Nothing yet.</p>
          ) : (
            <table className="!table w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11.5px] text-muted">
                  <th className="py-1 pr-2 font-medium">Type</th>
                  <th className="py-1 pr-2 text-right font-medium">Opened</th>
                  <th className="py-1 pr-2 text-right font-medium">Finished</th>
                  <th className="py-1 text-right font-medium">Left</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {r.tests.map((t) => (
                  <tr key={t.type}>
                    <td className="py-1.5 pr-2 text-body">
                      {TEST_NAMES[t.type] ?? t.type}
                      {t.blank > 0 && <span className="text-danger"> · {formatNumber(t.blank)} blank</span>}
                    </td>
                    <td className="py-1.5 pr-2 text-right font-semibold text-ink tabular-nums">{formatNumber(t.opened)}</td>
                    <td className="py-1.5 pr-2 text-right font-semibold text-ink tabular-nums">{formatNumber(t.finished)}</td>
                    <td className={cn("py-1.5 text-right font-semibold tabular-nums", t.left ? "text-danger" : "text-ink")}>{formatNumber(t.left)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Block>
        <Block title="Most-visited pages">
          <table className="!table w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11.5px] text-muted">
                <th className="py-1 pr-2 font-medium">Page</th>
                <th className="py-1 pr-2 text-right font-medium">Visits</th>
                <th className="py-1 text-right font-medium">Time spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {r.topPages.slice(0, 8).map((p) => (
                <tr key={p.path}>
                  <td className="max-w-0 truncate py-1.5 pr-2 text-body">{pageName(p.path)}</td>
                  <td className="py-1.5 pr-2 text-right font-semibold text-ink tabular-nums">{formatNumber(p.views)}</td>
                  <td className="py-1.5 text-right text-subtle tabular-nums">{duration(p.medianMs)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[11.5px] text-muted">Time spent is the median, counting only while the tab is on screen.</p>
        </Block>
        <Block title="Accounts and activity">
          <ul className="flex flex-col divide-y divide-line">
            {r.accounts.signUps.length === 0 && <Row label="Sign-ups" value="0" />}
            {r.accounts.signUps.map((x) => (
              <Row key={x.method} label={`Signed up (${SIGN_UP[x.method] ?? x.method})`} value={formatNumber(x.count)} />
            ))}
            <Row label="Signed in" value={formatNumber(r.accounts.signIns)} />
            <Row label="Chat questions asked" value={`${formatNumber(r.activity.chatQuestions.count)} · ${people(r.activity.chatQuestions.people)}`} />
            <Row label="Chat answers retried" value={formatNumber(r.activity.chatRetries.count)} />
            <Row label="Tests asked for" value={formatNumber(r.activity.testsRequested.count)} />
            <Row label="Easy Read opened" value={`${formatNumber(r.activity.easyReadOpens.count)} · ${people(r.activity.easyReadOpens.people)}`} />
          </ul>
        </Block>
      </div>

      {(r.apiErrors.length > 0 || r.jsErrors.length > 0) && (
        <Block title="Errors students saw" className="border-t border-line pt-5">
          <ul className="grid grid-cols-1 gap-x-8 lg:grid-cols-2">
            {r.apiErrors.slice(0, 6).map((e) => (
              <Row key={`${e.endpoint}-${e.status}`} label={<span className="font-mono text-[12px]">{`${e.endpoint} · ${e.status}`}</span>} value={formatNumber(e.count)} bad />
            ))}
            {r.jsErrors.slice(0, 4).map((e) => (
              <Row key={e.message} label={<span className="font-mono text-[12px]">{e.message}</span>} value={formatNumber(e.count)} bad />
            ))}
          </ul>
        </Block>
      )}
    </div>
  );
};

/** Live tracking from the app: steps, waits, failures, limits and where visits end. */
export const BehaviourPanel: FC<{ range: DayRange }> = ({ range }) => {
  const { data, isLoading } = useGetBehaviourQuery(range);
  const empty = !data?.totals.events;
  return (
    <Card className="flex flex-col gap-5 p-4 md:p-5" labelledBy="behaviour-title">
      <div className="flex flex-col gap-0.5">
        <h2 id="behaviour-title" className="text-[15px] font-bold text-ink">
          Where students get stuck
        </h2>
        <p className="text-[13px] text-subtle">
          {data && !empty
            ? `Live from the app: ${formatNumber(data.totals.students)} students and ${formatNumber(data.totals.visitors)} visitors in ${formatNumber(
                data.totals.sessions
              )} visits${data.since ? ` · tracking since ${formatDayAndTime(data.since)}` : ""}`
            : "Live from the app: every upload, test, chat answer, limit and error, as students go."}
        </p>
      </div>
      {isLoading ? (
        <LoadingBlock label="Loading" className="py-8" />
      ) : !data || empty ? (
        <p className="rounded-xl bg-well px-4 py-5 text-[13.5px] leading-relaxed text-body">
          Nothing tracked in these dates yet. Tracking starts once this version of the app is live; from then on, this shows how many students get from the upload
          page to a finished test, how long they wait, what fails, and where visits end. Claude reads it too.
        </p>
      ) : (
        <Body r={data} />
      )}
    </Card>
  );
};

/** One student's recent visits, event by event, on their profile. */
export const StudentVisits: FC<{ userId: string }> = ({ userId }) => {
  const { data, isLoading } = useGetStudentTimelineQuery(userId);
  return (
    <Card labelledBy="visits-h" className="flex flex-col gap-3 px-[22px] py-5">
      <div className="flex flex-col gap-0.5">
        <h2 id="visits-h" className="text-base font-bold text-ink">
          Recent visits
        </h2>
        <p className="text-[13px] text-subtle">Step by step, from live tracking in the app: what they opened, waited for, and where they stopped.</p>
      </div>
      {isLoading ? (
        <p className="py-3 text-sm text-subtle">Loading…</p>
      ) : !data?.length ? (
        <p className="py-3 text-sm text-subtle">No visits tracked yet. Tracking starts once this version of the app is live.</p>
      ) : (
        <ol className="flex flex-col gap-5">
          {data.slice(0, 6).map((s) => (
            <li key={s.sessionId} className="flex flex-col gap-2">
              <p className="flex items-baseline gap-2 text-[12.5px]">
                <b className="font-semibold text-ink">{formatDayAndTime(s.start)}</b>
                <span className="text-muted">
                  · {duration(new Date(s.end).getTime() - new Date(s.start).getTime())} · {s.events.length} steps
                </span>
              </p>
              <ul className="ml-1 flex flex-col gap-1 border-l-2 border-line pl-3.5">
                {s.events
                  .filter((e) => e.name !== "page_leave" || (e.ms ?? 0) > 20_000)
                  .slice(0, 40)
                  .map((e, i) => {
                    const d = describe(e);
                    return (
                      <li key={i} className="flex gap-3 text-[13px] leading-snug">
                        <span className="w-[44px] shrink-0 font-mono text-[11.5px] text-muted">{formatTime(e.at)}</span>
                        <span
                          className={cn(
                            d.tone === "bad" ? "font-medium text-danger-strong" : d.tone === "good" ? "text-success-strong" : d.tone === "quiet" ? "text-subtle" : "text-body"
                          )}
                        >
                          {d.text}
                        </span>
                      </li>
                    );
                  })}
              </ul>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
};
