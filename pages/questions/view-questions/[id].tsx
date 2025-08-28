import ViewQuestionCardContainer from "@/@modules/questions/ViewQuestionCardContainer";
import AppHead from "@/@shared/components/AppHead";
import { Pagination } from "@/@shared/components/Pagination/Pagination";
import Button from "@/@shared/ui/Button";
import ErrorMessage from "@/@shared/ui/ErrorMessage/ErrorMessage";
import { useGetQuestionSummariesQuery } from "@/api-services/questions.service";
import {
  useGetAllUserDocumentsQuery,
  useGetDocumentSummaryQuery,
  useGetRelatedYoutubeVideosQuery,
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
import ChevronLeft from "@/icons/ChevronLeft";
import { useRouter } from "next/router";
import {
  useGetAllSavedDocumentTopicsQuery,
  useGetAllSavedDocumentTopicsV2Query,
} from "@/api-services/document-topic.service";
import { useDispatch, useSelector } from "react-redux";
import { reduxStore, RootState } from "@/config/redux-config";
import { toast } from "react-toastify";
import Tab from "@/@shared/components/Tab";
import Spinner from "@/@shared/components/Spinner";
import {
  setDocumentIdInView,
  setDocumentTitleInView,
} from "@/features/documentChatSlice";
import SummaryContainer from "@/@modules/documents/SummaryContainer";
import RelatedVideosContainer from "@/@modules/documents/RelatedVideosContainer";
import Modal from "@/@shared/components/Modal";
import RelatedVideoPlayer from "@/@modules/documents/RelatedVideoPlayer";
import dynamic from "next/dynamic";
import ViewFileReaderThumbnail from "@/@modules/questions/ViewFileReaderThumbnail";
import LoadingReader from "@/@modules/questions/EasyRead/LoadingReader";
import EasyReadIcon from "@/icons/EasyReadIcon";
import { DocumentContentModel } from "@/models/document.model";
import NewTestForm from "@/@modules/questions/NewTestForm";
import { openNewTestForm } from "@/features/newTestSlice";
import TopicsContainer from "@/@modules/questions/EasyRead/TopicsContainer";
import TopicsHeaderAlt from "@/@modules/questions/EasyRead/TopicsHeaderAlt";
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
    "Related Videos",
  ]);

  useEffect(() => {
    const { tab } = router.query;
    if (tab && typeof tab === "string" && tabs.includes(tab)) {
      setActiveTab(tab);
    } else {
      setActiveTab(tabs[0]);
    }
  }, [router.query]);

  const { data: summaryData } = useGetDocumentSummaryQuery(
    { documentId },
    { skip: !documentId }
  );

  const {
    data: relatedVideos,
    isLoading: relatedVideosLoading,
    isError: relatedVideosError,
    refetch: refetchRelatedVideos,
  } = useGetRelatedYoutubeVideosQuery(
    { documentId },
    { skip: !documentId || activeTab !== "Related Videos" }
  );

  const [currentRelatedVideoId, setCurrentRelatedVideoId] = useState<
    string | null
  >(null);

  const { data: thumbnail } = useGetFileThumbnailDetailsQuery(
    { documentId },
    { skip: !documentId }
  );

  return (
    <>
      {currentRelatedVideoId && (
        <Modal>
          <RelatedVideoPlayer
            videoId={currentRelatedVideoId}
            handleClose={() => {
              setCurrentRelatedVideoId(null);
            }}
          />
        </Modal>
      )}
      <AppHead title="View Questions" />
      <AppLayout
        handleBack={() => {
          router.push(`/documents`);
        }}
      >
        <div className="hidden max-md:block">
          <Button
            title="Back"
            variant="text"
            starticon={<ChevronLeft />}
            className="!gap-1 mb-4 mt-7 max-sm:mt-0"
            onClick={() => {
              router.push(`/documents`);
            }}
          />
        </div>

        <div className="flex items-center justify-between w-full pb-4 max-lg:flex-col max-lg:gap-12">
          <h2 className="text-2xl font-bold max-lg:text-center max-w-[60%] lg:truncate max-lg:max-w-full">
            {document &&
              capitalizeFirstLetterOfEachWord(
                document.documents[0].title.toLowerCase()
              )}{" "}
          </h2>
          <div className="flex items-center gap-4">
            {!thumbnail?.thumbnailUrl.length ? (
              <></>
            ) : (
              <Button
                title="Easy Read"
                starticon={
                  <span className="-translate-y-[2px] translate-x-[5px]">
                    <EasyReadIcon width={20} height={20} />
                  </span>
                }
                variant="outlined"
                size="medium"
                className="!text-[#9333EA] !border-[#9333EA]"
                onClick={async () => {
                  router.push(`/easy-read/${documentId}`);
                }}
              />
            )}
            {permissions && (
              <Button title="New Test" onClick={handleNewTest} size="medium" />
            )}
          </div>
        </div>

        <Tab
          tabs={tabs}
          activeTab={activeTab}
          handleClickTab={(tabTitle) => {
            setActiveTab(tabTitle);
          }}
        />

        {activeTab === "Summary" && (
          <div>
            {summaryData ? (
              <SummaryContainer summary={summaryData?.summary || ""} />
            ) : null}
          </div>
        )}

        {activeTab === "Related Videos" && (
          <div>
            {!relatedVideos && relatedVideosError && (
              <div className="flex flex-col gap-4 justify-center items-center py-8">
                <ErrorMessage message="Something went wrong while trying to load related videos" />
                <Button
                  title="Reload related videos"
                  onClick={refetchRelatedVideos}
                />
              </div>
            )}
            {relatedVideosLoading && (
              <div className="flex flex-col gap-4 justify-center items-center py-8">
                <Spinner size="sm" />
                <p className="text-center font-semibold">
                  Loading related videos
                </p>
              </div>
            )}
            {relatedVideos && !relatedVideosLoading && (
              <RelatedVideosContainer
                data={relatedVideos ?? []}
                handlePlay={(title) => {
                  setCurrentRelatedVideoId(title);
                }}
              />
            )}
            {relatedVideos &&
              !relatedVideos.length &&
              !relatedVideosLoading &&
              !relatedVideosError && (
                <div className="flex flex-col gap-4 justify-center items-center py-8">
                  <p className="text-center font-semibold">No related videos</p>
                </div>
              )}
          </div>
        )}

        {activeTab === "Topics" && (
          <div>
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
          <div>
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
