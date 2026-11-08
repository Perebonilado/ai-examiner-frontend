import PerformanceTrackingBarItemContainer from "@/@modules/performance-tracking/PerformanceTrackingBarItemContainer";
import AppHead from "@/@shared/components/AppHead";
import AltTabContainer from "@/@shared/components/Tab/AltTabContainer";
import { useGetPerformanceTrackingForDocumentQuery } from "@/api-services/performance-tracking.service";
import AppLayout from "@/layouts/AppLayout";
import { PerformanceTrackingPeriodModel } from "@/models/performance-tracking.model";
import { capitalizeFirstLetterOfEachWord } from "@/utils";
import { NextPage } from "next";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const PERIODS: { title: string; id: PerformanceTrackingPeriodModel }[] = [
  { title: "Current", id: "this_week" },
  { title: "Last week", id: "last_week" },
];

const DocumentPerformanceTracking: NextPage = () => {
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [period, setPeriod] =
    useState<PerformanceTrackingPeriodModel>("this_week");
  const { data } = useGetPerformanceTrackingForDocumentQuery(
    { documentId: documentId || "", period },
    { skip: !documentId, refetchOnMountOrArgChange: true }
  );
  const params = useParams();

  useEffect(() => {
    if (params) {
      setDocumentId(params.id as string);
    }
  }, [params]);

  const title = data?.documentTitle
    ? capitalizeFirstLetterOfEachWord(data.documentTitle)
    : "";

  return (
    <>
      <AppLayout
        mobileTitle="Weekly report"
        crumbs={
          title && documentId
            ? [
                { label: "All documents", href: "/documents" },
                { label: title, href: `/questions/view-questions/${documentId}` },
                { label: "Weekly report" },
              ]
            : undefined
        }
      >
        <AppHead title={"Performance Tracking"} />
        <div className="mx-auto w-full max-w-[1000px]">
          <div className="mb-4 flex flex-col gap-4 md:mb-5 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-2xl font-bold leading-[1.2] tracking-[-0.015em] text-ink md:text-[28px]">
                Your weekly performance report
              </h1>
              <p className="mt-1.5 text-[15px] text-subtle">
                Insights across all topics
              </p>
            </div>

            <div className="shrink-0 [&>div]:ml-0">
              <AltTabContainer
                data={PERIODS.map((p) => ({
                  title: p.title,
                  isActive: period === p.id,
                }))}
                handleClick={(tab) => {
                  const next = PERIODS.find((p) => p.title === tab);
                  if (next) setPeriod(next.id);
                }}
              />
            </div>
          </div>

          {data && (
            <section
              aria-labelledby="weekly-title"
              className="rounded-2xl border border-edge bg-surface"
            >
              <header className="border-b border-line p-4 md:px-6 md:py-5">
                <h2
                  id="weekly-title"
                  className="text-balance text-lg font-bold leading-[1.35] tracking-[-0.02em] text-ink"
                >
                  {title}
                </h2>
                {data.period && (
                  <p className="mt-1 text-[13px] text-subtle tabular-nums md:text-sm">
                    {data.period}
                  </p>
                )}
              </header>

              <PerformanceTrackingBarItemContainer
                data={(data.data || []).map((d) => {
                  return { percentage: d[1], title: d[0] };
                })}
              />
            </section>
          )}
        </div>
      </AppLayout>
    </>
  );
};

export default DocumentPerformanceTracking;
