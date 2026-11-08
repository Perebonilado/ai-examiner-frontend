import ViewQuestionCardContainer from "@/@modules/questions/ViewQuestionCardContainer";
import AppHead from "@/@shared/components/AppHead";
import { Pagination } from "@/@shared/components/Pagination/Pagination";
import Button from "@/@shared/ui/Button";
import ErrorMessage from "@/@shared/ui/ErrorMessage/ErrorMessage";
import { useGetQuestionSummariesQuery } from "@/api-services/questions.service";
import {
  useGetAllUserDocumentsQuery,
  useGetDocumentSummaryQuery,
  DocumentService,
  useGetFileThumbnailDetailsQuery,
} from "@/api-services/document.service";
import { useModalContext } from "@/contexts/ModalContext";
import AppLayout from "@/layouts/AppLayout";
import { capitalizeFirstLetterOfEachWord } from "@/utils";
import { NextPage } from "next";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import GenerateQuestionsForm from "@/@modules/questions/GenerateQuestionsForm";
import { useRouter } from "next/router";
import {
  useGetAllSavedDocumentTopicsQuery,
  useGetAllSavedDocumentTopicsV2Query,
} from "@/api-services/document-topic.service";
import { useDispatch, useSelector } from "react-redux";
import { reduxStore, RootState } from "@/config/redux-config";
import { toast } from "react-toastify";
import Spinner from "@/@shared/components/Spinner";
import {
  setDocumentIdInView,
  setDocumentTitleInView,
} from "@/features/documentChatSlice";
import SummaryContainer from "@/@modules/documents/SummaryContainer";
import dynamic from "next/dynamic";
import ViewFileReaderThumbnail from "@/@modules/questions/ViewFileReaderThumbnail";
import LoadingReader from "@/@modules/questions/EasyRead/LoadingReader";
import { BookOpenText, Plus } from "lucide-react";
import { DocumentContentModel } from "@/models/document.model";
import NewTestForm from "@/@modules/questions/NewTestForm";
import { openNewTestForm } from "@/features/newTestSlice";
import TopicsContainer from "@/@modules/questions/EasyRead/TopicsContainer";
import TopicsHeaderAlt from "@/@modules/questions/EasyRead/TopicsHeaderAlt";
import MaxGenerationModal from "@/@shared/components/MaxGenerationModal";
const PDFReader = dynamic(
  () => import("@/@modules/questions/EasyRead/PDFReader"),
  {
    ssr: false,
  }
);

const ViewQuestions: NextPage = () => {
  // Question tab logic

  const [page, setPage] = useState(1);
  const [documentId, setdocumentId] = useState<string>("");
  const params = useParams();
  const { data, isLoading, error, refetch } = useGetQuestionSummariesQuery(
    {
      page,
      pageSize: 6,
      courseDocumentId: documentId,
    },
    { skip: !documentId, refetchOnMountOrArgChange: true }
  );

  const { data: document } = useGetAllUserDocumentsQuery(
    { courseId: "", page: 1, pageSize: 10, title: "", id: documentId },
    { refetchOnMountOrArgChange: true, skip: !documentId }
  );

  const { setModalContent } = useModalContext();
  const permissions = useSelector(
    (state: RootState) => state.permissionsState.permissions
  );

  const { data: topicsWithPages } = useGetAllSavedDocumentTopicsV2Query(
    { documentId },
    { skip: !documentId }
  );

  const handleNewTest = () => {
    dispatch(
      openNewTestForm({
        documentId: documentId,
        topics: topicsWithPages || [],
      })
    );
  };

  useEffect(() => {
    if (params) {
      setdocumentId(params.id as string);
    }
  }, [params]);

  useEffect(() => {
    if (error && "status" in error) {
      if ("data" in error) {
        const { message } = error.data as { message: string };
        toast.error(message);
      } else toast.error("Oops! Something went wrong");
    }
  }, [error]);

  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    if (documentId) {
      dispatch(setDocumentIdInView(documentId));
    }
  }, [documentId]);

  useEffect(() => {
    if (document?.documents) {
      dispatch(setDocumentTitleInView(document.documents[0].title));
    }
  }, [document]);

  // tabs

  const [activeTab, setActiveTab] = useState("Questions");
  const [tabs, setTabs] = useState([
    "Tests",
    "Topics",
    "Summary",
  ]);

  useEffect(() => {
    const { tab, maxEasyRead } = router.query;
    if (tab && typeof tab === "string" && tabs.includes(tab)) {
      setActiveTab(tab);
    } else {
      setActiveTab(tabs[0]);
    }

    if (maxEasyRead) {
      setModalContent(
        <MaxGenerationModal body="An upgrade is required to continue using Easy Read" />
      );
      const tabQueryParam = tab && typeof tab === "string" ? `?tab=${tab || ""}` : ""
      const [currentPath]= router.asPath.split("?")
      router.push(
        currentPath,
        undefined,
        {
          shallow: true,
        }
      );
    }
  }, [router.query]);

  const { data: summaryData } = useGetDocumentSummaryQuery(
    { documentId },
    { skip: !documentId }
  );


  const { data: thumbnail } = useGetFileThumbnailDetailsQuery(
    { documentId },
    { skip: !documentId }
  );

  return (
    <>
      <AppHead title="View Questions" />
      <AppLayout
        handleBack={() => {
          router.push(`/documents`);
        }}
      >
        {/* Title on its own line; one toolbar row under it: view tabs left, actions right. */}
        <h1 className="text-[26px] font-bold leading-tight tracking-[-0.02em] text-ink max-md:text-[22px]">
          {document &&
            capitalizeFirstLetterOfEachWord(
              document.documents[0].title.toLowerCase()
            )}
        </h1>

        <div className="mt-[18px] mb-6 flex items-center justify-between gap-3 border-b border-line pb-[18px] max-md:flex-col-reverse max-md:items-stretch max-md:mb-5 max-md:pb-4">
          <div
            role="tablist"
            aria-label="Document views"
            className="inline-flex w-fit gap-0.5 rounded-[10px] bg-sunken p-[3px] max-md:flex max-md:w-full"
          >
            {tabs.map((tab) => {
              const isActive = tab === activeTab;
              return (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab)}
                  className={
                    "h-[34px] whitespace-nowrap rounded-lg px-4 text-sm font-semibold transition-colors max-md:flex-1 max-md:px-2 " +
                    (isActive
                      ? "bg-surface text-ink shadow-[0_1px_2px_rgba(16,12,40,.1),0_0_0_0.5px_rgba(16,12,40,.06)]"
                      : "text-subtle hover:text-ink")
                  }
                >
                  {tab}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2.5 max-md:[&>*]:flex-1">
            {thumbnail?.thumbnailUrl.length ? (
              <Button
                title="Easy Read"
                starticon={
                  <BookOpenText
                    size={18}
                    strokeWidth={1.75}
                    className="text-accent"
                    aria-hidden="true"
                  />
                }
                variant="outlined"
                size="medium"
                onClick={() => {
                  router.push(`/easy-read/${documentId}`);
                }}
              />
            ) : null}
            {permissions && (
              <Button
                title="New test"
                starticon={<Plus size={18} strokeWidth={1.75} aria-hidden="true" />}
                onClick={handleNewTest}
                size="medium"
              />
            )}
          </div>
        </div>

        {activeTab === "Summary" && (
          <div className="min-h-[800px]">
            {summaryData ? (
              <SummaryContainer summary={summaryData?.summary || ""} />
            ) : null}
          </div>
        )}

        {activeTab === "Topics" && (
          <div className="min-h-[800px]">
            <TopicsContainer
              easyReadView={false}
              topicsScrollContainerMaxHeightPx={550}
              customHeader={(props) => {
                return <TopicsHeaderAlt {...props} />;
              }}
            />
          </div>
        )}

        {activeTab === "Tests" && (
          <div className="min-h-[800px]">
            {!data && error && (
              <div className="flex flex-col gap-4 justify-center items-center py-8">
                <ErrorMessage message="Something went wrong while trying to get question summaries for this document" />
                <Button title="Reload Question Summaries" onClick={refetch} />
              </div>
            )}
            {!data && isLoading && (
              <div className="flex flex-col gap-4 justify-center items-center py-8">
                <Spinner size="sm" />
                <p className="text-center font-semibold">Loading Tests</p>
              </div>
            )}
            {data && <ViewQuestionCardContainer data={data?.questions} />}

            {data && !data.questions.length && !isLoading && !error && (
              <div className="flex flex-col gap-4 justify-center items-center py-8">
                <p className="text-center font-semibold">No questions found</p>
              </div>
            )}

            {data && (
              <Pagination
                className=""
                currentPage={page}
                pageSize={data.meta.pageSize}
                totalCount={data.meta.totalCount}
                onPageChange={(p) => {
                  setPage(() => p);
                }}
              />
            )}
          </div>
        )}
      </AppLayout>
    </>
  );
};

export default ViewQuestions;
