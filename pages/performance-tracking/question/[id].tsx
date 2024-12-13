import PerformanceTrackingTopicInformation from "@/@modules/performance-tracking/PerformanceTrackingTopicInformation";
import TopicInfoCard from "@/@modules/performance-tracking/TopicInfoCard";
import TopicPerformancePieChart from "@/@modules/performance-tracking/TopicPerformancePieChart";
import GenerateQuestionsForm from "@/@modules/questions/GenerateQuestionsForm";
import AppHead from "@/@shared/components/AppHead";
import { useGetPerformanceTrackingForQuestionQuery } from "@/api-services/performance-tracking.service";
import { useModalContext } from "@/contexts/ModalContext";
import AppLayout from "@/layouts/AppLayout";
import { capitalizeFirstLetterOfEachWord } from "@/utils";
import { NextPage } from "next";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const PerformanceReviewPerQuestion: NextPage = () => {
  const [questionId, setQuestionId] = useState<string | null>(null);

  const { data } = useGetPerformanceTrackingForQuestionQuery(
    { questionId: questionId || "" },
    { skip: !questionId, refetchOnMountOrArgChange: true }
  );

  const params = useParams();

  useEffect(() => {
    if (params) {
      setQuestionId(params.id as string);
    }
  }, [params]);

  const { setModalContent } = useModalContext();

  return (
    <>
      <AppLayout>
        <AppHead title="Performance Tracking" />
        <h2 className="text-center font-bold text-2xl px-4">
          Performance Overview
        </h2>
        {data && (
          <>
            <p className="text-center mt-3 px-4">
              Insights from your{" "}
              {capitalizeFirstLetterOfEachWord(data.documentTitle)} test
            </p>
            <p className="text-center text-sm text-gray-400 mt-2 px-4">
              Score - {data.score}%
            </p>
          </>
        )}

        <div className="mt-14">
          {data && (
            <TopicPerformancePieChart
              percentageFailed={Number(
                data.percentageAnsweredWrongly.toFixed(2)
              )}
              percentagePassed={Number(
                data.percentageAnsweredCorrectly.toFixed(2)
              )}
            />
          )}
        </div>

        {data && (
          <div className="mt-16">
            <div className="w-full mx-auto">
              <TopicInfoCard
                status="fail"
                groupedQuestions={data.groupedQuestions}
                handleGenerateQuestions={(selectedTopics) => {
                  setModalContent(
                    <GenerateQuestionsForm
                      topics={selectedTopics.map((t)=>({label: t, value: t}))}
                      fileId={""}
                      documentIdProp={data.documentId}
                      allowTopicSelection={!selectedTopics.length}
                      preSelectedTopics={selectedTopics}
                      saveSelectedTopics={false}
                    />
                  );
                }}
              />
            </div>
          </div>
        )}
      </AppLayout>
    </>
  );
};

export default PerformanceReviewPerQuestion;
