import React, { FC, ReactNode, useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import cn from "classnames";
import { Clock } from "lucide-react";
import { toast } from "react-toastify";
import {
  useGetCampaignAudiencesQuery,
  useGetCampaignEstimateQuery,
  useGetCampaignQuery,
  usePreviewCampaignMutation,
  useResumeCampaignMutation,
  useScheduleCampaignMutation,
  useSendTestCampaignMutation,
  useUnscheduleCampaignMutation,
  useUpdateCampaignMutation,
} from "@/api-services/admin.service";
import { Audience, Campaign, CampaignEstimate } from "@/models/admin.model";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import Spinner from "@/@shared/components/Spinner";
import { ConfirmDialog } from "../AdminDialog";
import {
  defaultScheduleInputs,
  formatKey,
  formatNumber,
  formatTime,
  isoToLagosInputs,
  lagosDateKey,
  lagosToIso,
  shortUrl,
  todayKey,
} from "../format";
import { Card, ErrorState, LoadingBlock, buttonClass, inputClass } from "../ui";
import { audienceLabel, formatWhen } from "./campaignFormat";
import SaveStatusNote from "./SaveStatusNote";
import ScaledEmail from "./ScaledEmail";
import { useAutosave } from "./useAutosave";
import WizardHeader from "./WizardHeader";

interface Inbox {
  subject: string;
  preheader: string;
  audience: Audience;
}

type When = "now" | "schedule";

interface EmailLink {
  label: string;
  url: string;
}

/** Every link in the rendered email, minus the footer's own (unsubscribe, settings, view online). */
const readLinks = (html: string) => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const links: EmailLink[] = [];
  let unsubscribe = false;
  doc.querySelectorAll("a").forEach((a) => {
    const label = (a.textContent ?? "").replace(/\s+/g, " ").trim();
    const url = a.getAttribute("href") ?? "";
    if (/unsubscribe/i.test(label) || /unsubscribe/i.test(url)) {
      unsubscribe = true;
      return;
    }
    if (/email settings|view in browser|view online/i.test(label)) return;
    if (!links.some((l) => l.url === url && l.label === label)) links.push({ label: label || "Link", url });
  });
  return { links, unsubscribe };
};

const isRealUrl = (url: string) => /^(https?:|mailto:)/i.test(url.trim());

const Check: FC<{ ok: boolean | "info"; children: ReactNode }> = ({ ok, children }) => (
  <li className="flex items-start gap-2.5 text-sm">
    <span
      aria-hidden="true"
      className={cn(
        "grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-extrabold",
        ok === true && "bg-success-bg text-success-strong",
        ok === false && "bg-warning-bg text-[#7a4800] dark:text-warning",
        ok === "info" && "bg-hover text-subtle"
      )}
    >
      {ok === true ? "✓" : ok === false ? "!" : "i"}
    </span>
    <span className="sr-only">{ok === true ? "Done: " : ok === false ? "Check: " : "Note: "}</span>
    <span className="min-w-0 break-words leading-[1.45] text-body">{children}</span>
  </li>
);

const estimateSentence = (estimate: CampaignEstimate, when: When, time: string) => {
  const head = `${formatNumber(estimate.recipients)} ${estimate.recipients === 1 ? "email" : "emails"} at up to ${formatNumber(
    estimate.dailyLimit
  )} a day ${estimate.days <= 1 ? "goes out in one day" : `takes ${estimate.days} days`}.`;
  const startDay = estimate.startsOn === todayKey() ? "today" : formatKey.weekday(estimate.startsOn);
  const starts = when === "now" ? "It starts now" : `It starts ${startDay} at ${time}`;
  const tail =
    estimate.days <= 1 ? "." : ` and finishes on ${formatKey.long(estimate.finishesOn)}.`;
  return { head, rest: `${starts}${tail}` };
};

/** Step 3: subject, audience, when, a last look, then schedule or start. */
const CampaignReviewView: FC<{ id: string }> = ({ id }) => {
  const router = useRouter();
  const whenId = useId();
  const { data: campaign, isLoading, isError, refetch } = useGetCampaignQuery(id, { refetchOnMountOrArgChange: true });
  const { data: audiences } = useGetCampaignAudiencesQuery();
  const [updateCampaign] = useUpdateCampaignMutation();
  const [previewCampaign] = usePreviewCampaignMutation();
  const [sendTest, { isLoading: sendingTest }] = useSendTestCampaignMutation();
  const [schedule, { isLoading: scheduling }] = useScheduleCampaignMutation();
  const [unschedule, { isLoading: unscheduling }] = useUnscheduleCampaignMutation();
  const [resume, { isLoading: resuming }] = useResumeCampaignMutation();

  const [inbox, setInbox] = useState<Inbox | null>(null);
  const [when, setWhen] = useState<When>("schedule");
  const [date, setDate] = useState(defaultScheduleInputs().date);
  const [time, setTime] = useState(defaultScheduleInputs().time);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!campaign || inbox) return;
    setInbox({ subject: campaign.subject, preheader: campaign.preheader, audience: campaign.audience });
    if (campaign.scheduledAt) {
      const at = isoToLagosInputs(campaign.scheduledAt);
      setDate(at.date);
      setTime(at.time);
    }
  }, [campaign, inbox]);

  useEffect(() => {
    if (campaign && (campaign.status === "sending" || campaign.status === "sent")) {
      router.replace(`/admin/campaigns/${id}`);
    }
  }, [campaign, id, router]);

  const baseline = useMemo(
    () => (campaign ? { subject: campaign.subject, preheader: campaign.preheader, audience: campaign.audience } : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [!!campaign]
  );
  const { status, flush } = useAutosave<Inbox>(inbox, baseline, (value) =>
    updateCampaign({ id, body: value }).unwrap()
  );

  const sendAt = when === "schedule" && date && time ? lagosToIso(date, time) : null;
  const inPast = !!sendAt && new Date(sendAt).getTime() < Date.now();
  const audience = inbox?.audience ?? campaign?.audience ?? "all";
  const debouncedSendAt = useDebouncedValue(sendAt, 400);
  const { data: estimate, isFetching: estimating } = useGetCampaignEstimateQuery(
    { id, audience, sendAt: when === "schedule" ? debouncedSendAt : null },
    { skip: !campaign || (when === "schedule" && (!debouncedSendAt || inPast)) }
  );

  // The small preview follows the subject line as it is typed.
  const previewArgs = useDebouncedValue(inbox ? `${inbox.subject}\n${inbox.preheader}` : null, 500);
  useEffect(() => {
    if (!campaign || !inbox) return;
    let cancelled = false;
    previewCampaign({ id, body: { subject: inbox.subject, preheader: inbox.preheader } })
      .unwrap()
      .then((r) => !cancelled && setPreviewHtml(r.html))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewArgs, id, !!campaign]);

  const found = useMemo(() => (previewHtml ? readLinks(previewHtml) : null), [previewHtml]);

  if (isLoading || (campaign && !inbox))
    return (
      <>
        <WizardHeader current={3} campaignId={id} />
        <LoadingBlock label="Loading the campaign" />
      </>
    );
  if (!campaign || !inbox)
    return (
      <>
        <WizardHeader current={3} campaignId={id} />
        {isError ? <ErrorState title="We couldn't load this campaign." onRetry={refetch} /> : null}
      </>
    );

  const paused = campaign.status === "paused";
  const scheduled = campaign.status === "scheduled";
  const recipients = estimate?.recipients ?? audiences?.find((a) => a.key === audience)?.count ?? null;
  const nobody = recipients === 0;
  const subjectMissing = !inbox.subject.trim();
  const blocked = subjectMissing || nobody || (when === "schedule" && (!sendAt || inPast));
  const primaryLabel = paused
    ? "Resume sending"
    : when === "now"
    ? "Start sending"
    : scheduled
    ? "Update schedule"
    : "Schedule campaign";

  const handleGo = async () => {
    setConfirming(false);
    const ok = await flush();
    if (!ok) {
      toast.error("We couldn't save your changes. Check your connection and try again.");
      return;
    }
    try {
      if (paused) await resume(id).unwrap();
      else await schedule({ id, sendAt: when === "now" ? null : sendAt }).unwrap();
      router.push(`/admin/campaigns/${id}`);
    } catch {
      // The request's error toast says what went wrong.
    }
  };

  const handleTest = async () => {
    await flush();
    try {
      const { sentTo } = await sendTest({ id }).unwrap();
      toast.success(`Test sent to ${sentTo}`);
    } catch {
      // Toast already shown.
    }
  };

  const handleUnschedule = async () => {
    try {
      await unschedule(id).unwrap();
      toast.success("Unscheduled. The campaign is a draft again.");
    } catch {
      // Toast already shown.
    }
  };

  const testLine = (c: Campaign) => {
    if (!c.testSentAt) return null;
    const sameDay = lagosDateKey(c.testSentAt) === todayKey();
    return `Test sent to you ${sameDay ? "" : `on ${formatKey.dayMonth(lagosDateKey(c.testSentAt))} `}at ${formatTime(c.testSentAt)}`;
  };
  const sentence = estimate ? estimateSentence(estimate, when, time) : null;
  const usesName = /\{first name\}/i.test(campaign.content.body ?? "");

  return (
    <>
      <WizardHeader
        current={3}
        campaignId={id}
        canChangeTemplate={campaign.status === "draft"}
        actions={
          <>
            <SaveStatusNote status={status} onRetry={flush} />
            <button
              type="button"
              onClick={() => setConfirming(true)}
              disabled={(!paused && blocked) || scheduling || resuming}
              className={buttonClass.primary}
            >
              {primaryLabel}
            </button>
          </>
        }
      />

      <main className="mx-auto flex w-full max-w-[1240px] flex-wrap items-start gap-7 px-4 pb-12 pt-6 md:px-7 md:pt-[30px]">
        <div className="flex min-w-0 flex-[3_1_560px] flex-col gap-[18px]">
          <h1 className="text-[26px] font-bold leading-tight tracking-[-0.02em] text-ink">Review and send</h1>

          {scheduled && campaign.scheduledAt && (
            <div className="flex flex-wrap items-center gap-3 rounded-[14px] border border-[#bae0f7] bg-[#e0f2fe] px-[18px] py-3.5 text-sm text-[#075985] dark:border-[#1d4a66] dark:bg-[#0c2a3d] dark:text-[#9dd7f7]">
              <p className="mr-auto">
                Scheduled for <b className="font-bold">{formatWhen(campaign.scheduledAt)}</b> (Lagos time).
              </p>
              <button
                type="button"
                onClick={handleUnschedule}
                disabled={unscheduling}
                className={cn(buttonClass.small, "h-9")}
              >
                Unschedule
              </button>
            </div>
          )}

          <Card labelledBy="inbox-h" className="flex flex-col gap-3.5 px-[22px] py-5">
            <h2 id="inbox-h" className="text-base font-bold text-ink">
              In the inbox
            </h2>
            <label className="flex flex-col gap-1.5 text-[13px] font-bold text-ink">
              Subject
              <input
                value={inbox.subject}
                onChange={(e) => setInbox({ ...inbox, subject: e.target.value })}
                aria-invalid={subjectMissing || undefined}
                className={cn(inputClass, "font-normal")}
              />
            </label>
            {subjectMissing && <p className="-mt-2 text-[12.5px] font-semibold text-danger">Add a subject before sending.</p>}
            <label className="flex flex-col gap-1.5 text-[13px] font-bold text-ink">
              Preview text
              <input
                value={inbox.preheader}
                onChange={(e) => setInbox({ ...inbox, preheader: e.target.value })}
                aria-describedby="preheader-hint"
                className={cn(inputClass, "font-normal")}
              />
            </label>
            <p id="preheader-hint" className="-mt-2 text-[12.5px] text-muted">
              Shown after the subject in most inboxes.
            </p>
            <dl className="flex flex-wrap gap-x-8 gap-y-1 text-sm">
              <div className="flex gap-2">
                <dt className="font-bold text-ink">From name</dt>
                <dd className="text-body">AI Examiner</dd>
              </div>
            </dl>
          </Card>

          <Card labelledBy="who-h" className="flex flex-col gap-3 px-[22px] py-5">
            <h2 id="who-h" className="text-base font-bold text-ink">
              Who gets it
            </h2>
            {!audiences ? (
              <LoadingBlock className="!py-6" label="Loading audiences" />
            ) : (
              <div role="radiogroup" aria-labelledby="who-h" className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-2.5">
                {audiences.map((a) => {
                  const on = a.key === audience;
                  return (
                    <button
                      key={a.key}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      disabled={paused}
                      onClick={() => setInbox({ ...inbox, audience: a.key })}
                      className={cn(
                        "flex flex-col gap-[3px] rounded-xl px-4 py-3.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                        on ? "border-2 border-accent bg-accent-50" : "border border-control bg-surface hover:border-control-strong"
                      )}
                    >
                      <span className="text-sm font-bold text-ink">{a.label}</span>
                      <span className="text-[13px] text-subtle">
                        {formatNumber(a.count)} {a.count === 1 ? "person" : "people"}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
            <p className="text-[13px] text-subtle">Guest accounts and anyone who has unsubscribed are always left out.</p>
          </Card>

          {!paused && (
            <Card labelledBy={whenId} className="flex flex-col gap-3.5 px-[22px] py-5">
              <h2 id={whenId} className="text-base font-bold text-ink">
                When
              </h2>
              <div className="flex flex-wrap items-end gap-2.5">
                <div role="radiogroup" aria-labelledby={whenId} className="flex gap-2.5">
                  {(["now", "schedule"] as const).map((w) => (
                    <button
                      key={w}
                      type="button"
                      role="radio"
                      aria-checked={when === w}
                      onClick={() => setWhen(w)}
                      className={cn(
                        "h-[42px] rounded-[10px] px-4 text-sm transition-colors",
                        when === w
                          ? "border-2 border-accent bg-accent-50 font-bold text-accent-900"
                          : "border border-control bg-surface font-semibold text-body hover:border-control-strong"
                      )}
                    >
                      {w === "now" ? "Start now" : "Schedule"}
                    </button>
                  ))}
                </div>
                {when === "schedule" && (
                  <>
                    <label className="flex flex-col gap-1 text-[13px] font-semibold text-subtle">
                      Day
                      <input
                        type="date"
                        value={date}
                        min={todayKey()}
                        onChange={(e) => setDate(e.target.value)}
                        aria-invalid={inPast || undefined}
                        className={cn(inputClass, "w-[170px] font-normal")}
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-[13px] font-semibold text-subtle">
                      Time (Lagos)
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        aria-invalid={inPast || undefined}
                        className={cn(inputClass, "w-[130px] font-normal")}
                      />
                    </label>
                  </>
                )}
              </div>
              {when === "schedule" && inPast && (
                <p role="alert" className="text-[13px] font-semibold text-danger">
                  That time has passed. Pick a later one, or start now.
                </p>
              )}
              <div className="flex gap-3 rounded-xl bg-[#fbf1cc] px-4 py-3.5 text-[#0b0b0c] dark:bg-[#2e2610] dark:text-ink">
                <Clock size={18} strokeWidth={1.8} aria-hidden="true" className="mt-0.5 shrink-0 text-[#6b4e00] dark:text-[#f2d27a]" />
                <p aria-live="polite" className="text-sm leading-[1.55]">
                  {nobody ? (
                    <b className="font-bold">Nobody in this group can get marketing email yet.</b>
                  ) : sentence ? (
                    <>
                      <b className="font-bold">{sentence.head}</b> {sentence.rest}
                    </>
                  ) : estimating ? (
                    "Working out how long it takes…"
                  ) : (
                    "Pick when to send to see how long it takes."
                  )}
                </p>
              </div>
            </Card>
          )}
        </div>

        <aside aria-label="Before you send" className="flex min-w-0 flex-[2_1_340px] flex-col gap-3.5">
          <Card as="div" className="flex flex-col gap-3 p-4">
            <div className="flex items-start gap-3 rounded-xl bg-well p-3">
              <span
                aria-hidden="true"
                className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full bg-[#5b2ad6] text-xs font-semibold text-white"
              >
                AI
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="flex gap-2 text-[13.5px]">
                  <b className="font-bold text-ink">AI Examiner</b>
                  <span className="ml-auto text-muted">{paused || when === "now" ? "Now" : time}</span>
                </span>
                <span className="truncate text-[13.5px] font-semibold text-ink">{inbox.subject || "No subject"}</span>
                <span className="truncate text-[13px] text-subtle">{inbox.preheader}</span>
              </span>
            </div>
            <ScaledEmail html={previewHtml} />
            <Link href={`/admin/campaigns/${id}/edit`} className="self-start text-[13px] font-semibold text-accent hover:text-accent-900">
              Edit the email
            </Link>
          </Card>

          <Card labelledBy="checks-h" className="flex flex-col gap-3 px-5 py-[18px]">
            <h2 id="checks-h" className="text-base font-bold text-ink">
              Checks
            </h2>
            <ul className="flex flex-col gap-3">
              <Check ok={!!campaign.testSentAt}>
                {testLine(campaign) ?? "No test sent yet. Send one to see it in a real inbox."}
              </Check>
              {found && (
                <Check ok={found.unsubscribe}>
                  {found.unsubscribe ? "Unsubscribe link is in the footer" : "We couldn't find the unsubscribe link"}
                </Check>
              )}
              {found?.links.map((l, i) => (
                <Check key={`${l.url}-${i}`} ok={isRealUrl(l.url)}>
                  {isRealUrl(l.url) ? (
                    <>
                      {l.label}: <span className="text-subtle">{shortUrl(l.url)}</span>
                    </>
                  ) : (
                    <>&ldquo;{l.label}&rdquo; has no web address yet</>
                  )}
                </Check>
              ))}
              {!found && (
                <li className="flex items-center gap-2 text-sm text-subtle">
                  <Spinner size="xs" /> Checking the links…
                </li>
              )}
              <Check ok={usesName ? true : "info"}>
                {usesName ? "Every person is greeted by first name" : "The message doesn't use {first name}"}
              </Check>
            </ul>
            <button type="button" onClick={handleTest} disabled={sendingTest} className={buttonClass.secondary}>
              {sendingTest && <Spinner size="xs" tone="current" />}
              {campaign.testSentAt ? "Send me another test" : "Send me a test"}
            </button>
          </Card>
        </aside>
      </main>

      <ConfirmDialog
        open={confirming}
        title={paused ? "Resume sending?" : when === "now" ? "Start sending now?" : "Schedule this campaign?"}
        confirmLabel={primaryLabel}
        busy={scheduling || resuming}
        onConfirm={handleGo}
        onClose={() => setConfirming(false)}
        message={
          <>
            <p>
              {recipients !== null ? `${formatNumber(recipients)} people in` : "Everyone in"} &ldquo;
              {audienceLabel(audience, audiences)}&rdquo; will get &ldquo;{inbox.subject}&rdquo;
              {paused ? "" : when === "now" ? ", starting now." : `, starting ${sendAt ? formatWhen(sendAt) : ""}.`}
            </p>
            {!campaign.testSentAt && <p className="mt-2 font-semibold text-ink">You haven&apos;t sent yourself a test yet.</p>}
            <p className="mt-2">You can pause it from the campaign&apos;s page.</p>
          </>
        }
      />
    </>
  );
};

export default CampaignReviewView;
