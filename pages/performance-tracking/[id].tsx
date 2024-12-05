import MoreDataAccordion from "@/@modules/performance-tracking/MoreDataAccordion";
import PerformanceTrackingBarItemContainer from "@/@modules/performance-tracking/PerformanceTrackingBarItemContainer";
import AppHead from "@/@shared/components/AppHead";
import Pill from "@/@shared/components/Pill";
import Button from "@/@shared/ui/Button";
import { useGetCourseByIdQuery } from "@/api-services/course.service";
import AppLayout from "@/layouts/AppLayout";
import { NextPage } from "next";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const DocumentPerformanceTracking: NextPage = () => {
  const [documentId, setDocumentId] = useState<string | null>(null);

  const params = useParams();

  useEffect(() => {
    if (params) {
      setDocumentId(params.id as string);
    }
  }, [params]);
  return <>
  <AppLayout>
    <AppHead title={"Performance Tracking"} />
    <div>
      <h1 className="px-3 text-center text-2xl font-bold">
        Your weekly performance report
      </h1>
      <p className="px-3 text-center mt-2">Insights across all topics</p>
    </div>

    <div className="w-full max-w-[500px] mx-auto pt-6 flex gap-3 flex-wrap justify-center">
      <Pill title="Current" isActive={true} />
      <Pill title="Last Week" isActive={false} />
    </div>

    <div className="text-center mt-20 flex justify-center items-center flex-col gap-1">
      <h3 className="font-bold text-xl">Retina</h3>
      <p className="text-sm text-[#939393]">Nov 19 - Nov 26</p>
    </div>

    <div className="w-full mt-8">
      <PerformanceTrackingBarItemContainer
        data={[
          { title: "Photoreceptors", percentage: 30 },
          { title: "Photoreceptors", percentage: 90 },
          { title: "Photoreceptors", percentage: 3 },
          { title: "Photoreceptors", percentage: 25 },
        ]}
      />
    </div>

    <div className="mt-6">
      <MoreDataAccordion
        data={[
          { comment: "do better", score: 24, title: "testing" },
          { comment: "do better", score: 24, title: "testing" },
          { comment: "do better", score: 24, title: "testing" },
        ]
        }
      />
    </div>
  </AppLayout>
</>;
};

export default DocumentPerformanceTracking;
