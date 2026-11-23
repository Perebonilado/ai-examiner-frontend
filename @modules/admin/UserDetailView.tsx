import React, { FC, useState } from "react";
import Link from "next/link";
import cn from "classnames";
import { ArrowRight, Check, Copy, Mail } from "lucide-react";
import { useGetAdminUserQuery } from "@/api-services/admin.service";
import { AdminUserDetail } from "@/models/admin.model";
import { PLAN_CHIPS } from "./activityTypes";
import {
  dayLabel,
  formatDate,
  formatDayAndTime,
  formatDuration,
  formatNumber,
  formatTime,
  initialsOf,
  relativeTime,
  formatReading,
  sentenceCase,
  todayKey,
} from "./format";
import { YearCalendar, longestStreak } from "./charts/YearCalendar";
import { Avatar, Breadcrumb, Card, Chip, ErrorState, LoadingBlock, TypeChip, buttonClass } from "./ui";
import { StudentFollowUps, StudentLabels } from "./insights/StudentInsights";
import { StudentVisits } from "./insights/BehaviourPanel";

const CopyEmail: FC<{ email: string }> = ({ email }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={buttonClass.secondary}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(email);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // Clipboard blocked: the address is on screen to copy by hand.
        }
      }}
    >
      {copied ? (
        <Check size={16} strokeWidth={1.8} aria-hidden="true" />
      ) : (
        <Copy size={16} strokeWidth={1.8} aria-hidden="true" />
      )}
      <span aria-live="polite">{copied ? "Copied" : "Copy email"}</span>
    </button>
  );
};

const Profile: FC<{ detail: AdminUserDetail; now: Date }> = ({ detail, now }) => {
  const { user } = detail;
  const name = `${user.firstName} ${user.lastName}`.trim() || "Guest";
  const plan = PLAN_CHIPS[user.plan] ?? PLAN_CHIPS.free;
  const facts = [
    user.email ?? "No email",
    user.institution,
    user.createdOn ? `Signed up ${formatDate(user.createdOn)}` : null,
  ].filter(Boolean);

  return (
    <Card label="Profile" className="flex flex-wrap items-center gap-x-6 gap-y-[18px] px-6 py-[22px]">
      <Avatar initials={initialsOf(name)} seed={user.id} size={64} online={user.online} />
      <div className="mr-auto flex min-w-0 flex-[1_1_240px] flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-[-0.02em] text-ink">{name}</h1>
          <Chip tone={plan.tone} size="md">
            {user.planName ?? plan.label}
          </Chip>
        </div>
        <p className="break-words text-sm text-subtle">{facts.join(" · ")}</p>
        {user.online ? (
          <p className="inline-flex items-center gap-[7px] text-sm font-semibold text-success-strong">
            <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-success" />
            Online now{user.doing ? ` · ${user.doing}` : ""}
          </p>
        ) : (
          <p className="inline-flex items-center gap-[7px] text-sm text-subtle">
            <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-control" />
            Last seen {relativeTime(user.lastSeenAt, now).toLowerCase()}
          </p>
        )}
      </div>
      {user.email && (
        <div className="flex flex-wrap gap-2.5">
          <CopyEmail email={user.email} />
          <a href={`mailto:${user.email}`} className={buttonClass.primary}>
            <Mail size={16} strokeWidth={1.8} aria-hidden="true" />
            Email {user.firstName || "them"}
          </a>
        </div>
      )}
    </Card>
  );
};

const Row: FC<{ label: string; value: React.ReactNode; className?: string }> = ({ label, value, className }) => (
  <div className="flex gap-3 text-sm">
    <dt className="flex-1 text-subtle">{label}</dt>
    <dd className={cn("font-semibold text-ink", className)}>{value}</dd>
  </div>
);

/** One person: who they are, how much they use AI Examiner, and what they did recently. */
const UserDetailView: FC<{ id: string }> = ({ id }) => {
  const { data, isLoading, isError, refetch } = useGetAdminUserQuery(id, { refetchOnMountOrArgChange: true });
  const now = new Date();

  if (isLoading) return <LoadingBlock label="Loading this person" />;
  if (!data) return isError ? <ErrorState title="We couldn't load this person." onRetry={refetch} /> : null;

  const { stats, user } = data;
  const name = `${user.firstName} ${user.lastName}`.trim() || "Guest";
  const calendar = data.calendar ?? [];
  const streak = longestStreak(new Set(calendar.map((c) => c.day)));
  const tiles = [
    ["Documents", formatNumber(stats.documents)],
    ["Tests made", formatNumber(stats.tests)],
    ["Average score", stats.averageScore === null ? "–" : `${Math.round(stats.averageScore)}%`],
    ["Easy Read time", formatReading(data.easyRead?.seconds ?? 0)],
    ["Oral vivas", formatNumber(stats.vivas)],
    ["Chat questions", formatNumber(stats.chatQuestions)],
  ];

  return (
    <>
      <Breadcrumb parent={{ label: "Users", href: "/admin/users" }} current={name} />
      <Profile detail={data} now={now} />

      <section aria-label="Usage" className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
        {tiles.map(([label, value]) => (
          <div key={label} className="flex flex-col gap-1 rounded-[14px] border border-line bg-surface px-4 py-3.5">
            <p className="text-[12.5px] font-semibold text-subtle">{label}</p>
            <p className="text-[22px] font-bold tracking-[-0.02em] text-ink tabular-nums">{value}</p>
          </div>
        ))}
      </section>

      <Card labelledBy="year-h" className="flex flex-col gap-4 px-[22px] py-5">
        <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
          <div className="mr-auto flex flex-col gap-0.5">
            <h2 id="year-h" className="text-base font-bold text-ink">
              The last 12 months
            </h2>
            <p className="text-[13px] text-subtle">
              Tests made and finished, uploads, chat questions, Easy Read reading and sign-ins, per day (Lagos time).
            </p>
          </div>
          <dl className="flex gap-6 text-[13px]">
            {[
              ["Actions", formatNumber(calendar.reduce((a, c) => a + c.count, 0))],
              ["Active days", formatNumber(calendar.length)],
              ["Longest streak", `${formatNumber(streak)} ${streak === 1 ? "day" : "days"}`],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-col">
                <dt className="text-muted">{label}</dt>
                <dd className="text-[17px] font-bold text-ink tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <YearCalendar counts={calendar} today={todayKey()} />
      </Card>

      <StudentLabels userId={user.id} name={name} />

      <StudentVisits userId={user.id} />

      <div className="flex flex-wrap items-start gap-3.5">
        <Card labelledBy="tl-h" className="flex flex-[2_1_520px] flex-col gap-1 px-[22px] py-5">
          <div className="mb-1.5 flex items-center gap-3">
            <h2 id="tl-h" className="mr-auto text-base font-bold text-ink">
              Recent activity
            </h2>
            <Link
              href={{ pathname: "/admin/activity", query: { person: user.id, personName: name, range: "all" } }}
              className="inline-flex items-center gap-1 text-[13px] font-semibold text-accent hover:text-accent-900"
            >
              All their activity <ArrowRight size={14} strokeWidth={2} aria-hidden="true" />
            </Link>
          </div>
          {data.days.length === 0 ? (
            <p className="py-4 text-sm text-subtle">No activity yet.</p>
          ) : (
            data.days.map((day) => (
              <div key={day.date} className="flex flex-col">
                <h3 className="mb-1.5 mt-3.5 text-[12.5px] font-bold text-muted">{dayLabel(day.date, now)}</h3>
                <ul>
                  {day.items.map((e) => (
                    <li key={e.id} className="flex gap-3 py-[9px] sm:gap-3.5">
                      <span className="w-[52px] shrink-0 font-mono text-[12.5px] text-muted">
                        {formatTime(e.createdOn)}
                      </span>
                      <span className="w-[78px] shrink-0">
                        <TypeChip type={e.type} />
                      </span>
                      <span className="min-w-0 text-sm leading-[1.45] text-body">{sentenceCase(e.detail)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </Card>

        <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-3.5">
          <StudentFollowUps userId={user.id} />
          <Card labelledBy="plan-h" className="flex flex-col gap-2.5 px-[22px] py-5">
            <h2 id="plan-h" className="text-base font-bold text-ink">
              Plan
            </h2>
            <dl className="flex flex-col gap-2.5">
              <Row label="Current plan" value={user.planName ?? (PLAN_CHIPS[user.plan] ?? PLAN_CHIPS.free).label} />
              <Row
                label="Oral viva time"
                value={data.callCredits === null ? "–" : `${formatNumber(data.callCredits)} min left`}
              />
              <Row
                label="Marketing emails"
                value={data.marketing.subscribed ? "Subscribed" : "Unsubscribed"}
                className={data.marketing.subscribed ? "text-success-strong" : "text-subtle"}
              />
            </dl>
          </Card>
          <Card labelledBy="er-h" className="flex flex-col gap-3 px-[22px] py-5">
            <h2 id="er-h" className="text-base font-bold text-ink">
              Easy Read
            </h2>
            {!data.easyRead?.seconds ? (
              <p className="text-sm text-subtle">No reading time recorded yet.</p>
            ) : (
              <>
                <dl className="flex flex-col gap-2.5">
                  <Row label="Reading time" value={formatReading(data.easyRead.seconds)} />
                  <Row label="This month" value={formatReading(data.easyRead.secondsThisMonth)} />
                  <Row
                    label="Sessions"
                    value={`${formatNumber(data.easyRead.sessions)} · ${formatReading(
                      data.easyRead.seconds / Math.max(1, data.easyRead.sessions)
                    )} each`}
                  />
                  <Row label="Last read" value={relativeTime(data.easyRead.lastReadAt, now)} />
                </dl>
                {data.easyRead.top.length > 0 && (
                  <div className="flex flex-col gap-1.5 border-t border-line pt-3">
                    <h3 className="text-[12.5px] font-bold text-muted">Read the longest</h3>
                    <ul className="flex flex-col gap-1.5">
                      {data.easyRead.top.map((d) => (
                        <li key={d.documentId} className="flex gap-3 text-sm">
                          <span className="min-w-0 flex-1 truncate text-body">{d.title}</span>
                          <span className="shrink-0 font-semibold text-ink tabular-nums">{formatReading(d.seconds)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </Card>
          <Card labelledBy="signin-h" className="flex flex-col gap-2.5 px-[22px] py-5">
            <h2 id="signin-h" className="text-base font-bold text-ink">
              Recent sign-ins
            </h2>
            {data.signIns.length === 0 ? (
              <p className="text-sm text-subtle">No sign-ins recorded.</p>
            ) : (
              <ul className="flex flex-col gap-2.5">
                {data.signIns.map((s) => (
                  <li key={s.createdOn} className="flex gap-2.5 text-sm">
                    <span className="flex-1 text-body">{formatDayAndTime(s.createdOn, now)}</span>
                    <span className="text-muted">{s.device ?? "Unknown device"}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
};

export default UserDetailView;
