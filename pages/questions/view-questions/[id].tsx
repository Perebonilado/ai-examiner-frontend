import ViewQuestionCardContainer from "@/@modules/questions/ViewQuestionCardContainer";
import AppHead from "@/@shared/components/AppHead";
import { Pagination } from "@/@shared/components/Pagination/Pagination";
import Button from "@/@shared/ui/Button";
import ErrorMessage from "@/@shared/ui/ErrorMessage/ErrorMessage";
import { useGetQuestionSummariesQuery } from "@/api-services/questions.service";
import {
  useGetAllUserDocumentsQuery,
  useGetModifiedDocumentFileQuery,
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
import { useGetAllSavedDocumentTopicsQuery } from "@/api-services/document-topic.service";
import { useDispatch, useSelector } from "react-redux";
import { reduxStore, RootState } from "@/config/redux-config";
import { toast } from "react-toastify";
import { AppLoader } from "@/@shared/components/AppLoader";
import Tab from "@/@shared/components/Tab";
import ChatContainer from "@/@modules/chat/ChatContainer";
import { useGetDocumentMessagesQuery } from "@/api-services/document-message.service";
import Spinner from "@/@shared/components/Spinner";
import {
  setDocumentIdInView,
  setDocumentTitleInView,
  setMessages,
} from "@/features/documentChatSlice";
import SummaryContainer from "@/@modules/documents/SummaryContainer";
import RelatedVideosContainer from "@/@modules/documents/RelatedVideosContainer";
import Modal from "@/@shared/components/Modal";
import RelatedVideoPlayer from "@/@modules/documents/RelatedVideoPlayer";
import dynamic from "next/dynamic";
import ViewFileReaderThumbnail from "@/@modules/questions/ViewFileReaderThumbnail";
import AdditionalSettingsIcon from "@/icons/AdditionalSettingsIcon";
import LoadingReader from "@/@modules/questions/EasyRead/LoadingReader";
import EasyReadIcon from "@/icons/EasyReadIcon";
const PDFReader = dynamic(
  () => import("@/@modules/questions/EasyRead/PDFReader"),
  {
    ssr: false,
  }
);

interface SearchParams {
  lastMessageCreatedOn?: Date;
  courseDocumentId: string;
  limit: number;
}

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

  const { data: topics, isLoading: topicsLoading } =
    useGetAllSavedDocumentTopicsQuery(
      { documentId },
      { skip: !documentId, refetchOnMountOrArgChange: true }
    );

  const { setModalContent } = useModalContext();
  const permissions = useSelector(
    (state: RootState) => state.permissionsState.permissions
  );

  const handleGenerateQuestions = () => {
    setModalContent(
      <GenerateQuestionsForm
        topics={topics?.topics ?? []}
        fileId={data?.fileId || ""}
      />
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
  const [tabs, setTabs] = useState(["Questions", "Summary", "Related Videos"]);

  useEffect(() => {
    const { tab } = router.query;
    if (tab && typeof tab === "string" && tabs.includes(tab)) {
      setActiveTab(tab);
    } else {
      setActiveTab(tabs[0]);
    }
  }, [router.query]);

  useEffect(() => {
    const openEasyReader = async () => {
      const urls = await getFileUrls(documentId);

      if (urls) {
        setModalContent(
          <PDFReader
            modifiedFileUrl={urls.modified}
            originalFileUrl={urls.original}
          />
        );
      }
    };
    if (documentId && router.query?.tool === "easyRead") {
      openEasyReader();
    }
  }, [documentId, router.query]);

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

  const [fileUrls, setFileUrls] = useState({ original: "", modified: "" });

  const { data: thumbnail } = useGetFileThumbnailDetailsQuery(
    { documentId },
    { skip: !documentId }
  );

  const [isFetchingFile, setIsFetchingFile] = useState(false);

  const getFileUrls = async (documentId: string) => {
    setIsFetchingFile(true);
    try {
      const { getModifiedDocumentFile, getOriginalDocumentFile } =
        DocumentService.endpoints;
      const [originalFileUrl, modifiedFileUrl] = await Promise.all([
        reduxStore.dispatch(getOriginalDocumentFile.initiate({ documentId })),
        reduxStore.dispatch(getModifiedDocumentFile.initiate({ documentId })),
      ]);
      setIsFetchingFile(false);
      if (originalFileUrl.data && modifiedFileUrl.data) {
        return {
          modified: modifiedFileUrl.data?.modifiedFile,
          original: originalFileUrl.data?.modifiedFile,
        };
      }

      return null;
    } catch (error) {
      setIsFetchingFile(false);
      toast.error("Failed to load file");
    }
    setIsFetchingFile(false);
  };

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
      {isFetchingFile && <LoadingReader />}
      <AppHead title="View Questions" />
      <AppLayout>
        <Button
          title="Back"
          variant="text"
          starticon={<ChevronLeft />}
          className="!gap-1 mb-4 mt-7 max-sm:mt-0"
          onClick={() => {
            router.push(`/documents`);
          }}
        />

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
                    <EasyReadIcon />
                  </span>
                }
                variant="text"
                size="large"
                className="!text-[#9333EA]"
                onClick={async () => {
                  if (!fileUrls.modified && !fileUrls.original) {
                    const urls = await getFileUrls(documentId);

                    if (urls) {
                      setModalContent(
                        <PDFReader
                          modifiedFileUrl={urls.modified}
                          originalFileUrl={urls.original}
                        />
                      );
                    }
                  } else {
                    setModalContent(
                      <PDFReader
                        modifiedFileUrl={fileUrls.modified}
                        originalFileUrl={fileUrls.original}
                      />
                    );
                  }
                }}
              />
            )}
            {permissions && (
              <Button
                title="New Test"
                onClick={handleGenerateQuestions}
                size="large"
              />
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

        {activeTab === "Easy Study" && (
          <div>
            {thumbnail && (
              <ViewFileReaderThumbnail
                // iframUrl={thumbnail.iframUrl}
                // thumbnailUrl={thumbnail.thumbnailUrl}
                handleClick={async () => {
                  if (!fileUrls.modified && !fileUrls.original) {
                    const urls = await getFileUrls(documentId);

                    if (urls) {
                      setModalContent(
                        <PDFReader
                          modifiedFileUrl={urls.modified}
                          originalFileUrl={urls.original}
                        />
                      );
                    }
                  } else {
                    setModalContent(
                      <PDFReader
                        modifiedFileUrl={fileUrls.modified}
                        originalFileUrl={fileUrls.original}
                      />
                    );
                  }
                }}
              />
            )}
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

        {activeTab === "Questions" && (
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
                <p className="text-center font-semibold">
                  Fetching your questions
                </p>
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

