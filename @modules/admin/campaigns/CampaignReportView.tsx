import React, { FC, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import cn from "classnames";
import { Pause, Play } from "lucide-react";
import { toast } from "react-toastify";
import {
  useGetCampaignAudiencesQuery,
  useGetCampaignReportQuery,
  useGetCampaignTemplatesQuery,
  usePauseCampaignMutation,
  usePreviewCampaignMutation,
  useResumeCampaignMutation,
  useUnscheduleCampaignMutation,
} from "@/api-services/admin.service";
import { CampaignReport } from "@/models/admin.model";
import AdminDialog from "../AdminDialog";
import { STATUS_CHIPS } from "../activityTypes";
import { formatKey, formatNumber, lagosDateKey } from "../format";
import { Breadcrumb, Card, Chip, ErrorState, LoadingBlock, ProgressBar, buttonClass } from "../ui";
import { audienceLabel, formatWhen, pct, pctLabel, shortPath } from "./campaignFormat";
import EmailFrame from "./EmailFrame";

const DAY_STATUS = {
  sent: { label: "Sent", text: "text-success-strong", bar: "bg-accent-bright", weight: "font-medium" },
  today: { label: "Sent today", text: "text-accent-900", bar: "bg-accent-bright", weight: "font-bold" },
  queued: { label: "Queued", text: "text-muted", bar: "bg-control", weight: "font-medium" },
} as const;

const DayByDay: FC<{ days: CampaignReport["days"] }> = ({ days }) => {
  const max = Math.max(1, ...days.map((d) => d.count));
  return (
    <Card labelledBy="days-h" className="flex flex-[3_1_480px] flex-col px-[22px] py-5">
      <h2 id="days-h" className="mb-2 text-base font-bold text-ink">
        Day by day
      </h2>
      {days.length === 0 ? (
        <p className="py-4 text-sm text-subtle">Nothing has been sent yet.</p>
      ) : (
        <ul>
          {days.map((d) => {
            const meta = DAY_STATUS[d.status] ?? DAY_STATUS.queued;
            return (
              <li key={d.date} className="flex items-center gap-3 border-t border-hover py-2.5 text-sm">
                <span className={cn("w-[92px] shrink-0 text-body sm:w-[120px]", meta.weight)}>
                  {formatKey.weekdayDayMonth(d.date)}
                </span>
                <ProgressBar pct={(d.count / max) * 100} height={8} barClassName={meta.bar} className="min-w-[40px] flex-1" />
                <span className="w-[54px] text-right text-body tabular-nums">{formatNumber(d.count)}</span>
                <span className={cn("w-[76px] text-right text-[12.5px] font-bold sm:w-[96px]", meta.text)}>{meta.label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
};

/** One campaign's sending report: progress, clicks, bounces, and pause or resume. */
const CampaignReportView: FC<{ id: string }> = ({ id }) => {
  const router = useRouter();
  const [polling, setPolling] = useState(0);
  const { data, isLoading, isError, refetch } = useGetCampaignReportQuery(id, {
    refetchOnMountOrArgChange: true,
    pollingInterval: polling,
    skipPollingIfUnfocused: true,
  });
  const { data: audiences } = useGetCampaignAudiencesQuery();
  const { data: templates } = useGetCampaignTemplatesQuery();
  const [pause, { isLoading: pausing }] = usePauseCampaignMutation();
  const [resume, { isLoading: resuming }] = useResumeCampaignMutation();
  const [unschedule, { isLoading: unscheduling }] = useUnscheduleCampaignMutation();
  const [previewCampaign, { isLoading: previewing }] = usePreviewCampaignMutation();
  const [viewing, setViewing] = useState<string | null>(null);
  const [showBounces, setShowBounces] = useState(false);

  const campaign = data?.campaign;

  // While it sends, the numbers move: refresh every 30 s.
  useEffect(() => setPolling(campaign?.status === "sending" ? 30_000 : 0), [campaign?.status]);

  // Drafts have nothing to report yet.
  useEffect(() => {
    if (campaign?.status === "draft") router.replace(`/admin/campaigns/${id}/edit`);
  }, [campaign?.status, id, router]);

  if (isLoading) return <LoadingBlock label="Loading the report" />;
  if (!data || !campaign) return isError ? <ErrorState title="We couldn't load this campaign." onRetry={refetch} /> : null;

  const chip = STATUS_CHIPS[campaign.status];
  const template = templates?.find((t) => t.key === campaign.templateKey);
  const total = campaign.totalRecipients;
  const left = Math.max(0, total - campaign.sentCount - campaign.failedCount);
  const queuedDays = data.days.filter((d) => d.status === "queued").length;
  const bounced = data.bounces.count || campaign.failedCount;

  const openEmail = async () => {
    try {
      const { html } = await previewCampaign({ id, body: {} }).unwrap();
      setViewing(html);
    } catch {
      toast.error("We couldn't open the email. Try again.");
    }
  };

  const act = async (action: "pause" | "resume" | "unschedule") => {
    try {
      if (action === "pause") await pause(id).unwrap();
      if (action === "resume") await resume(id).unwrap();
      if (action === "unschedule") {
        await unschedule(id).unwrap();
        router.push(`/admin/campaigns/${id}/edit`);
      }
    } catch {
      // The request's error toast says what went wrong.
    }
  };

  const finishedOn = campaign.finishedAt ? formatKey.long(lagosDateKey(campaign.finishedAt)) : null;
  const finishLine: React.ReactNode =
    campaign.status === "sent" ? (
      finishedOn ? (
        <>
          Finished <b className="font-bold text-ink">{finishedOn}</b>
        </>
      ) : (
        "Finished"
      )
    ) : campaign.status === "scheduled" && campaign.scheduledAt ? (
      <>
        Starts <b className="font-bold text-ink">{formatWhen(campaign.scheduledAt)}</b>
      </>
    ) : campaign.estimate?.finishesOn ? (
      <>
        {campaign.status === "paused" ? "Paused. Would finish" : "Finishes"}{" "}
        <b className="font-bold text-ink">{formatKey.long(campaign.estimate.finishesOn)}</b>
      </>
    ) : campaign.status === "paused" ? (
      "Paused"
    ) : null;

  const stats = [
    {
      label: "Clicked",
      value: formatNumber(campaign.clickCount),
      note: `${pctLabel(campaign.clickCount, campaign.sentCount)} of people sent it`,
    },
    {
      label: "Unsubscribed",
      value: formatNumber(campaign.unsubscribeCount),
      note: pctLabel(campaign.unsubscribeCount, campaign.sentCount),
    },
    { label: "Couldn't deliver", value: formatNumber(bounced), note: "Bounced" },
    {
      label: "Still to send",
      value: formatNumber(left),
      note:
        left === 0
          ? "All done"
          : queuedDays > 0
          ? `Queued for the next ${queuedDays === 1 ? "day" : `${queuedDays} days`}`
          : "Queued",
    },
  ];

  return (
    <>
      <Breadcrumb parent={{ label: "Campaigns", href: "/admin/campaigns" }} current={campaign.name} />

      <header className="flex flex-wrap items-end gap-x-5 gap-y-3">
        <div className="mr-auto flex min-w-0 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-[26px] font-bold leading-tight tracking-[-0.02em] text-ink">{campaign.name}</h1>
            <Chip tone={chip.tone} size="md">
              {chip.label}
            </Chip>
          </div>
          <p className="break-words text-sm text-subtle">
            Subject: {campaign.subject} · {audienceLabel(campaign.audience, audiences)}
            {template ? ` · ${template.title} template` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button type="button" onClick={openEmail} disabled={previewing} className={buttonClass.secondary}>
            View the email
          </button>
          {campaign.status === "sending" && (
            <button type="button" onClick={() => act("pause")} disabled={pausing} className={buttonClass.danger}>
              <Pause size={15} fill="currentColor" strokeWidth={0} aria-hidden="true" />
              Pause sending
            </button>
          )}
          {campaign.status === "paused" && (
            <button type="button" onClick={() => act("resume")} disabled={resuming} className={buttonClass.primary}>
              <Play size={15} fill="currentColor" strokeWidth={0} aria-hidden="true" />
              Resume sending
            </button>
          )}
          {campaign.status === "scheduled" && (
            <>
              <button type="button" onClick={() => act("unschedule")} disabled={unscheduling} className={buttonClass.secondary}>
                Unschedule
              </button>
              <Link href={`/admin/campaigns/${id}/review`} className={buttonClass.primary}>
                Change
              </Link>
            </>
          )}
        </div>
      </header>

      <Card labelledBy="prog-h" className="flex flex-col gap-3.5 px-6 py-[22px]">
        <div className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1.5">
          <h2 id="prog-h" className="text-[30px] font-bold tracking-[-0.03em] text-ink tabular-nums">
            {formatNumber(campaign.sentCount)}{" "}
            <span className="text-lg font-semibold text-subtle">of {formatNumber(total)} sent</span>
          </h2>
          {finishLine && <span className="text-sm text-body sm:ml-auto">{finishLine}</span>}
        </div>
        <ProgressBar pct={pct(campaign.sentCount, total)} height={12} />
        <div className="mt-1 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col gap-0.5 rounded-xl bg-well px-3.5 py-3">
              <span className="text-[12.5px] font-semibold text-subtle">{s.label}</span>
              <span className="text-[22px] font-bold tracking-[-0.02em] text-ink tabular-nums">{s.value}</span>
              <span className="text-[12.5px] text-muted">{s.note}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex flex-wrap items-start gap-3.5">
        <DayByDay days={data.days} />

        <div className="flex min-w-0 flex-[2_1_320px] flex-col gap-3.5">
          <Card labelledBy="links-h" className="flex flex-col gap-3 px-[22px] py-5">
            <h2 id="links-h" className="text-base font-bold text-ink">
              Clicks by link
            </h2>
            {data.links.length === 0 ? (
              <p className="text-sm text-subtle">No links in this email.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {data.links.map((l) => (
                  <li key={`${l.label}-${l.url}`} className="flex gap-2.5 text-sm">
                    <span className="min-w-0 flex-1 break-words text-body">
                      {l.label} · <span className="text-subtle">{shortPath(l.url)}</span>
                    </span>
                    <b className="font-bold text-ink tabular-nums">{formatNumber(l.clicks)}</b>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card labelledBy="fail-h" className="flex flex-col gap-2.5 px-[22px] py-5">
            <h2 id="fail-h" className="text-base font-bold text-ink">
              Couldn&apos;t deliver
            </h2>
            {bounced === 0 ? (
              <p className="text-sm text-body">Every email has been delivered so far.</p>
            ) : (
              <>
                <p className="text-sm leading-[1.55] text-body">
                  {formatNumber(bounced)} {bounced === 1 ? "address" : "addresses"} bounced. Addresses that no longer
                  exist are left out of future campaigns.
                </p>
                {data.bounces.items.length > 0 && (
                  <>
                    <button
                      type="button"
                      aria-expanded={showBounces}
                      aria-controls="bounce-list"
                      onClick={() => setShowBounces((v) => !v)}
                      className="self-start text-[13px] font-semibold text-accent hover:text-accent-900"
                    >
                      {showBounces ? "Hide the addresses" : "See the addresses"}
                    </button>
                    <div id="bounce-list">
                      {showBounces && (
                        <ul className="flex flex-col gap-2 text-[13px]">
                          {data.bounces.items.map((b) => (
                            <li key={b.email} className="flex flex-col border-t border-hover pt-2">
                              <span className="break-all font-semibold text-ink">{b.email}</span>
                              <span className="text-subtle">{b.reason}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </Card>
        </div>
      </div>

      <AdminDialog open={viewing !== null} title={campaign.subject || "The email"} onClose={() => setViewing(null)} wide>
        {viewing && (
          <div className="overflow-x-auto rounded-md bg-[#f4f4f6]">
            <EmailFrame html={viewing} width={600} title="The email" className="mx-auto w-fit" />
          </div>
        )}
      </AdminDialog>
    </>
  );
};

export default CampaignReportView;
