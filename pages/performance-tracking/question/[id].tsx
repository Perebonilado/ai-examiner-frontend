import TopicInfoCard from "@/@modules/performance-tracking/TopicInfoCard";
import AppHead from "@/@shared/components/AppHead";
import { useGetAllSavedDocumentTopicsV2Query } from "@/api-services/document-topic.service";
import { useGetPerformanceTrackingForQuestionQuery } from "@/api-services/performance-tracking.service";
import { openNewTestForm, resetNewTestForm } from "@/features/newTestSlice";
import AppLayout from "@/layouts/AppLayout";
import { capitalizeFirstLetterOfEachWord } from "@/utils";
import { NextPage } from "next";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

const normaliseTopic = (topic: string) => topic.trim().toLowerCase();

const PerformanceReviewPerQuestion: NextPage = () => {
  const [questionId, setQuestionId] = useState<string | null>(null);

  const { data } = useGetPerformanceTrackingForQuestionQuery(
    { questionId: questionId || "" },
    { skip: !questionId, refetchOnMountOrArgChange: true }
  );

  // The document's saved topics: the New test form selects topics by id
  const { data: documentTopics } = useGetAllSavedDocumentTopicsV2Query(
    { documentId: data?.documentId || "" },
    { skip: !data?.documentId }
  );

  const params = useParams();

  useEffect(() => {
    if (params) {
      setQuestionId(params.id as string);
    }
  }, [params]);

  const dispatch = useDispatch();

  const router = useRouter();
  const { type } = router.query;

  const handleGenerateQuestions = (selectedTopics: string[]) => {
    if (!data) return;

    // Open the multistep New test form, preselected with the checked topics. Topics saved on the
    // document go by id (page-range retrieval); if any checked topic is only a tag from this test,
    // all checked topics go by name instead, since the API ignores names when ids are sent.
    const byTitle = new Map(
      (documentTopics || []).map((t) => [normaliseTopic(t.title), t])
    );
    const matched = selectedTopics
      .map((t) => byTitle.get(normaliseTopic(t)))
      .filter((t): t is NonNullable<typeof t> => Boolean(t));
    const allSaved = matched.length === selectedTopics.length;

    dispatch(resetNewTestForm());
    dispatch(
      openNewTestForm({
        documentId: data.documentId,
        topics: documentTopics || [],
        selectedTopics: allSaved ? matched : [],
        selectedQuestionTopics: allSaved ? [] : selectedTopics,
      })
    );
  };

  const title = data?.documentTitle
    ? capitalizeFirstLetterOfEachWord(data.documentTitle)
    : "";

  return (
    <>
      <AppLayout
        handleBack={() => {
          router.push(`/questions/practise-questions/${type}/${questionId}`);
        }}
        mobileTitle={title || "Performance overview"}
        crumbs={
          data
            ? [
                { label: "All documents", href: "/documents" },
                {
                  label: title,
                  href: `/questions/view-questions/${data.documentId}`,
                },
                { label: "Performance overview" },
              ]
            : undefined
        }
      >
        <AppHead title="Performance Tracking" />

        <div className="mx-auto w-full max-w-[1000px]">
          <div className="mb-4 md:mb-5">
            <h1 className="text-2xl font-bold leading-[1.2] tracking-[-0.015em] text-ink md:text-[28px]">
              Performance overview
            </h1>
            {data && (
              <p className="mt-1.5 text-[15px] text-subtle">
                Insights from your {title} test
              </p>
            )}
          </div>

          {data && (
            <TopicInfoCard
              score={data.score}
              groupedQuestions={data.groupedQuestions}
              handleGenerateQuestions={handleGenerateQuestions}
            />
          )}
        </div>
      </AppLayout>
    </>
  );
};

export default PerformanceReviewPerQuestion;
