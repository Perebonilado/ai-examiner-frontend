import MoreDataAccordion from "@/@modules/performance-tracking/PerformanceTrackingTopicInformation";
import PerformanceTrackingBarItemContainer from "@/@modules/performance-tracking/PerformanceTrackingBarItemContainer";
import AppHead from "@/@shared/components/AppHead";
import Pill from "@/@shared/components/Pill";
import { useGetPerformanceTrackingForDocumentQuery } from "@/api-services/performance-tracking.service";
import AppLayout from "@/layouts/AppLayout";
import { PerformanceTrackingPeriodModel } from "@/models/performance-tracking.model";
import { NextPage } from "next";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

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

  return (
    <>
      <AppLayout>
        <AppHead title={"Performance Tracking"} />
        <div>
          <h1 className="px-3 text-center text-2xl font-bold">
            Your weekly performance report
          </h1>
          <p className="px-3 text-center mt-2">Insights across all topics</p>
        </div>

        <div className="w-full max-w-[500px] mx-auto pt-6 flex gap-3 flex-wrap justify-center">
          <Pill
            title="Current"
            id="this_week"
            isActive={period === "this_week"}
            handleClick={(id) => {
              setPeriod(id as PerformanceTrackingPeriodModel);
            }}
          />
          <Pill
            title="Last Week"
            id="last_week"
            isActive={period === "last_week"}
            handleClick={(id) => {
              setPeriod(id as PerformanceTrackingPeriodModel);
            }}
          />
        </div>

        {data && (
          <div className="text-center mt-20 flex justify-center items-center flex-col gap-1">
            <h3 className="font-bold text-xl">{data.documentTitle}</h3>
            <p className="text-sm text-[#939393]">{data.period}</p>
          </div>
        )}

        <div className="w-full mt-8">
          {data && <PerformanceTrackingBarItemContainer
            data={data.data.map((d)=>{
              return {percentage: d['1'], title: d[0]}
            })}
          />}
        </div>

        {/* <div className="mt-6">
          {data && <MoreDataAccordion
            data={data.data.map((d)=>{
              return {comment: d[2], score: d[1], title: d[0]}
            })}
          />}
        </div> */}
      </AppLayout>
    </>
  );
};

export default DocumentPerformanceTracking;
