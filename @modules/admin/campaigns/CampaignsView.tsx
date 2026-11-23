import React, { FC, KeyboardEvent, useId, useRef, useState } from "react";
import Link from "next/link";
import cn from "classnames";
import { Clock, Plus } from "lucide-react";
import {
  useGetCampaignAudiencesQuery,
  useGetCampaignsQuery,
} from "@/api-services/admin.service";
import { Campaign, CampaignStatus } from "@/models/admin.model";
import { STATUS_CHIPS } from "../activityTypes";
import { formatNumber } from "../format";
import {
  Chip,
  EmptyState,
  ErrorState,
  LoadingBlock,
  PageHeader,
  ProgressBar,
  Td,
  Th,
  buttonClass,
} from "../ui";
import {
  audienceLabel,
  campaignHref,
  campaignStatusLine,
  pct,
} from "./campaignFormat";

type Tab = "" | CampaignStatus;

const TABS: { value: Tab; label: string; countKey: "all" | CampaignStatus }[] =
  [
    { value: "", label: "All", countKey: "all" },
    { value: "draft", label: "Drafts", countKey: "draft" },
    { value: "scheduled", label: "Scheduled", countKey: "scheduled" },
    { value: "sending", label: "Sending", countKey: "sending" },
    { value: "paused", label: "Paused", countKey: "paused" },
    { value: "sent", label: "Sent", countKey: "sent" },
  ];

const NoneYet: FC = () => (
  <>
    <span aria-hidden="true">–</span>
    <span className="sr-only">None yet</span>
  </>
);

const hasResults = (c: Campaign) =>
  c.status === "sending" || c.status === "paused" || c.status === "sent";

/** Every marketing campaign by status, with the daily sending limit up top. */
const CampaignsView: FC = () => {
  const [tab, setTab] = useState<Tab>("");
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const { data, isLoading, isFetching, isError, refetch } =
    useGetCampaignsQuery({ status: tab }, { refetchOnMountOrArgChange: true });
  const { data: audiences } = useGetCampaignAudiencesQuery();

  // Paused only shows when something is paused (or it is the open tab).
  const tabs = TABS.filter(
    (t) =>
      t.value !== "paused" ||
      tab === "paused" ||
      (data?.counts.paused ?? 0) > 0,
  );
  const now = new Date();

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const move = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    const to =
      e.key === "Home"
        ? 0
        : e.key === "End"
          ? tabs.length - 1
          : (index + move + tabs.length) % tabs.length;
    if (!move && e.key !== "Home" && e.key !== "End") return;
    e.preventDefault();
    setTab(tabs[to].value);
    tabRefs.current[to]?.focus();
  };

  const used = data ? Math.min(data.usedToday, data.dailyLimit) : 0;
  const activeIndex = Math.max(
    0,
    tabs.findIndex((t) => t.value === tab),
  );

  return (
    <>
      <PageHeader
        title="Campaigns"
        subtitle={
          data
            ? `${formatNumber(data.subscribed)} people can get marketing emails · ${formatNumber(
                data.unsubscribed,
              )} have unsubscribed`
            : " "
        }
        actions={
          <Link href="/admin/campaigns/new" className={buttonClass.primary}>
            <Plus size={16} strokeWidth={2} aria-hidden="true" />
            New campaign
          </Link>
        }
      />

      {data && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-[14px] border border-warning-line bg-warning-bg px-[18px] py-3.5 text-sm text-body">
          <Clock
            size={18}
            strokeWidth={1.8}
            aria-hidden="true"
            className="shrink-0 text-[#7a4800] dark:text-warning"
          />
          <p className="min-w-0 flex-[1_1_420px]">
            Campaigns go out through your Gmail account,{" "}
            <b className="font-bold text-ink">
              up to {formatNumber(data.dailyLimit)} a day
            </b>
            . Gmail allows about 500, and the rest is kept for password and viva
            emails. Bigger campaigns carry on the next day.
          </p>
          <p className="font-bold text-[#7a4800] tabular-nums dark:text-warning">
            Today: {formatNumber(used)} of {formatNumber(data.dailyLimit)} used
          </p>
        </div>
      )}

      {/* Scrolls sideways on a phone instead of wrapping the tabs onto two lines. */}
      <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:px-0">
        <div
          role="tablist"
          aria-label="Campaign status"
          className="flex w-max min-w-full gap-1 border-b border-line"
        >
          {tabs.map((t, i) => {
            const selected = t.value === tab;
            return (
              <button
                key={t.label}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                id={`${baseId}-tab-${t.label}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`${baseId}-panel`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setTab(t.value)}
                onKeyDown={(e) => onTabKey(e, i)}
                className={cn(
                  "-mb-px h-[42px] shrink-0 whitespace-nowrap border-b-2 px-3.5 text-sm transition-colors",
                  selected
                    ? "border-ink font-bold text-ink"
                    : "border-transparent font-medium text-subtle hover:text-ink",
                )}
              >
                {t.label}{" "}
                <span className="font-medium text-muted tabular-nums">
                  {data ? formatNumber(data.counts[t.countKey] ?? 0) : ""}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        id={`${baseId}-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${tabs[activeIndex]?.label}`}
        aria-busy={isFetching}
        className={cn(
          "relative overflow-x-auto rounded-2xl border border-line bg-surface transition-opacity",
          {
            "opacity-60": isFetching && !isLoading,
          },
        )}
      >
        {isLoading ? (
          <LoadingBlock label="Loading campaigns" />
        ) : !data ? (
          isError ? (
            <ErrorState onRetry={refetch} />
          ) : null
        ) : data.campaigns.length === 0 ? (
          <EmptyState title={tab ? "Nothing here" : "No campaigns yet"}>
            {tab ? (
              "No campaigns have this status."
            ) : (
              <Link href="/admin/campaigns/new" className={buttonClass.link}>
                Start your first campaign
              </Link>
            )}
          </EmptyState>
        ) : (
          <>
            {/* Phones and tablets: one card-like row per campaign, the whole row opens it. */}
            <ul
              aria-label="Campaigns"
              className="divide-y divide-line lg:hidden"
            >
              {data.campaigns.map((c) => {
                const chip = STATUS_CHIPS[c.status];
                const progress =
                  c.status === "sending" || c.status === "paused";
                const audienceCount =
                  c.totalRecipients ||
                  audiences?.find((a) => a.key === c.audience)?.count ||
                  0;
                return (
                  <li key={c.id}>
                    <Link
                      href={campaignHref(c)}
                      className="flex flex-col gap-1.5 px-4 py-3.5 transition-colors hover:bg-canvas"
                    >
                      <span className="font-semibold text-ink">{c.name}</span>
                      <span className="text-[13px] text-muted">
                        Subject: {c.subject || "–"}
                      </span>
                      <span className="inline-flex flex-wrap items-center gap-2 text-[13px]">
                        <Chip
                          tone={chip.tone}
                          className="!h-auto rounded-full px-2 py-0.5 text-[12px]"
                        >
                          {chip.label}
                        </Chip>
                        <span className="text-subtle">
                          {campaignStatusLine(c, now)}
                        </span>
                      </span>
                      {progress && (
                        <ProgressBar
                          pct={pct(c.sentCount, c.totalRecipients)}
                        />
                      )}
                      <span className="text-[13px] text-body">
                        {audienceLabel(c.audience, audiences)}
                        {audienceCount
                          ? ` · ${formatNumber(audienceCount)}`
                          : ""}
                        {hasResults(c)
                          ? ` · ${formatNumber(c.clickCount)} ${c.clickCount === 1 ? "click" : "clicks"} · ${formatNumber(
                              c.unsubscribeCount,
                            )} unsubscribed`
                          : ""}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="hidden lg:block">
              <table className="!table w-full min-w-[900px] border-collapse text-sm">
                <caption className="sr-only">Campaigns</caption>
                <thead>
                  <tr>
                    <Th>Campaign</Th>
                    <Th className="w-[260px]">Status</Th>
                    <Th>Audience</Th>
                    <Th align="right">Clicks</Th>
                    <Th align="right">Unsubscribed</Th>
                  </tr>
                </thead>
                <tbody>
                  {data.campaigns.map((c) => {
                    const chip = STATUS_CHIPS[c.status];
                    const progress =
                      c.status === "sending" || c.status === "paused";
                    const audienceCount =
                      c.totalRecipients ||
                      audiences?.find((a) => a.key === c.audience)?.count ||
                      0;
                    return (
                      <tr
                        key={c.id}
                        className="group transition-colors hover:bg-canvas"
                      >
                        <Td className="py-3.5">
                          <Link
                            href={campaignHref(c)}
                            className="flex flex-col gap-0.5 rounded-md"
                          >
                            <span className="font-semibold text-ink">
                              {c.name}
                            </span>
                            <span className="text-[13px] text-muted">
                              Subject: {c.subject || "–"}
                            </span>
                          </Link>
                        </Td>
                        <Td className="py-3.5">
                          <span className="flex flex-col gap-1.5">
                            <span className="inline-flex flex-wrap items-center gap-2 text-[13px]">
                              <Chip
                                tone={chip.tone}
                                className="!h-auto rounded-full px-2 py-0.5 text-[12px]"
                              >
                                {chip.label}
                              </Chip>
                              <span className="text-subtle">
                                {campaignStatusLine(c, now)}
                              </span>
                            </span>
                            {progress && (
                              <ProgressBar
                                pct={pct(c.sentCount, c.totalRecipients)}
                              />
                            )}
                          </span>
                        </Td>
                        <Td className="py-3.5 text-body">
                          {audienceLabel(c.audience, audiences)}
                          {audienceCount
                            ? ` · ${formatNumber(audienceCount)}`
                            : ""}
                        </Td>
                        <Td align="right" className="py-3.5">
                          {hasResults(c) ? (
                            formatNumber(c.clickCount)
                          ) : (
                            <NoneYet />
                          )}
                        </Td>
                        <Td align="right" className="py-3.5">
                          {hasResults(c) ? (
                            formatNumber(c.unsubscribeCount)
                          ) : (
                            <NoneYet />
                          )}
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CampaignsView;
