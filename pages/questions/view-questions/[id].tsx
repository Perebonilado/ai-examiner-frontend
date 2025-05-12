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

  useEffect(() => {
    if (isLoading) {
      setModalContent(<AppLoader />);
    } else {
      setModalContent(null);
    }
  }, [isLoading]);

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
    "Questions",
    "Summary",
    "Easy Study",
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

  const [fileUrls, setFileUrls] = useState({ original: "", modified: "" });

  useEffect(() => {
    const getFileUrls = async (documentId: string) => {
      const { getModifiedDocumentFile, getOriginalDocumentFile } =
        DocumentService.endpoints;
      const [originalFileUrl, modifiedFileUrl] = await Promise.all([
        reduxStore.dispatch(getOriginalDocumentFile.initiate({ documentId })),
        reduxStore.dispatch(getModifiedDocumentFile.initiate({ documentId })),
      ]);
      if (originalFileUrl.data && modifiedFileUrl.data)
        setFileUrls({
          modified: modifiedFileUrl.data?.modifiedFile,
          original: originalFileUrl.data?.modifiedFile,
        });
    };

    if (documentId && activeTab === "Easy Study") {
      getFileUrls(documentId);
    }
  }, [documentId, activeTab]);

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

        <div className="flex items-center justify-between w-full pb-4 max-md:flex-col max-md:gap-12">
          <h2 className="text-2xl font-bold max-md:text-center max-w-[60%] md:truncate max-md:max-w-full">
            {document &&
              capitalizeFirstLetterOfEachWord(
                document.documents[0].title.toLowerCase()
              )}{" "}
          </h2>
          {permissions && (
            <Button
              title="New Questions"
              onClick={handleGenerateQuestions}
              size="large"
            />
          )}
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
            
            <Button
              title="Open"
              onClick={() => {
                if (fileUrls.modified && fileUrls.original) {
                  setModalContent(
                    <PDFReader
                      modifiedFileUrl={fileUrls.modified}
                      originalFileUrl={fileUrls.original}
                    />
                  );
                }
              }}
            />
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

const mockData = [
  {
    kind: "youtube#searchResult",
    etag: "mZq-LVfV0pZKmz_KCGRYY2VTSPo",
    id: {
      kind: "youtube#video",
      videoId: "PGB6dN1KlwQ",
    },
    snippet: {
      publishedAt: "2016-02-09T11:11:37Z",
      channelId: "UCesNt4_Z-Pm41RzpAClfVcg",
      title:
        "Liver Cirrhosis (SandS, Pathophysiology, Investigations, Management)",
      description:
        "http://armandoh.org/ MAKE THIS LECTURE STICK: FREE PRACTICE QUESTIONS HERE!",
      thumbnails: {
        default: {
          url: "https://i.ytimg.com/vi/PGB6dN1KlwQ/default.jpg",
          width: 120,
          height: 90,
        },
        medium: {
          url: "https://i.ytimg.com/vi/PGB6dN1KlwQ/mqdefault.jpg",
          width: 320,
          height: 180,
        },
        high: {
          url: "https://i.ytimg.com/vi/PGB6dN1KlwQ/hqdefault.jpg",
          width: 480,
          height: 360,
        },
      },
      channelTitle: "Armando Hasudungan",
      liveBroadcastContent: "none",
      publishTime: "2016-02-09T11:11:37Z",
    },
  },
  {
    kind: "youtube#searchResult",
    etag: "t98t1o0CO9ZOmF7_FARbXZ2OLxk",
    id: {
      kind: "youtube#video",
      videoId: "g2mLjGRTxSY",
    },
    snippet: {
      publishedAt: "2021-02-10T21:03:05Z",
      channelId: "UCYSNDNB934__U_dJG9WDhVQ",
      title: "Cirrhosis - What is cirrhosis?",
      description:
        "This video will teach you about the symptoms and stages of cirrhosis. You'll also learn what the liver does and how damage to the ...",
      thumbnails: {
        default: {
          url: "https://i.ytimg.com/vi/g2mLjGRTxSY/default.jpg",
          width: 120,
          height: 90,
        },
        medium: {
          url: "https://i.ytimg.com/vi/g2mLjGRTxSY/mqdefault.jpg",
          width: 320,
          height: 180,
        },
        high: {
          url: "https://i.ytimg.com/vi/g2mLjGRTxSY/hqdefault.jpg",
          width: 480,
          height: 360,
        },
      },
      channelTitle: "MyHealth.Alberta.ca",
      liveBroadcastContent: "none",
      publishTime: "2021-02-10T21:03:05Z",
    },
  },
  {
    kind: "youtube#searchResult",
    etag: "0A6Yw04p2T-iHDmNnxN9r0gU5Ac",
    id: {
      kind: "youtube#video",
      videoId: "RudR2_VVoaw",
    },
    snippet: {
      publishedAt: "2017-02-14T16:50:29Z",
      channelId: "UCNI0qOojpkhsUtaQ4_2NUhQ",
      title: "Alcohol-related liver disease - causes, symptoms &amp; pathology",
      description:
        "What is alcoholic hepatitis? Well, chronic alcohol consumption puts serious strain on the liver and is one of the leading causes of ...",
      thumbnails: {
        default: {
          url: "https://i.ytimg.com/vi/RudR2_VVoaw/default.jpg",
          width: 120,
          height: 90,
        },
        medium: {
          url: "https://i.ytimg.com/vi/RudR2_VVoaw/mqdefault.jpg",
          width: 320,
          height: 180,
        },
        high: {
          url: "https://i.ytimg.com/vi/RudR2_VVoaw/hqdefault.jpg",
          width: 480,
          height: 360,
        },
      },
      channelTitle: "Osmosis from Elsevier",
      liveBroadcastContent: "none",
      publishTime: "2017-02-14T16:50:29Z",
    },
  },
  {
    kind: "youtube#searchResult",
    etag: "WDqPXKOTiNXt_pyjEOr8gQTGvho",
    id: {
      kind: "youtube#video",
      videoId: "OLd3PFLfGl4",
    },
    snippet: {
      publishedAt: "2018-02-14T16:30:15Z",
      channelId: "UCFPvnkCZbHfBvV8ApBBE0vA",
      title:
        "Liver Disease Signs &amp; Symptoms (ex. gynecomastia, bruising) | Hepatic Stigmata",
      description:
        "Lesson on Hepatic Stigmata and the clinical signs and symptoms of liver disease including cirrhosis and hepatitis. The liver has ...",
      thumbnails: {
        default: {
          url: "https://i.ytimg.com/vi/OLd3PFLfGl4/default.jpg",
          width: 120,
          height: 90,
        },
        medium: {
          url: "https://i.ytimg.com/vi/OLd3PFLfGl4/mqdefault.jpg",
          width: 320,
          height: 180,
        },
        high: {
          url: "https://i.ytimg.com/vi/OLd3PFLfGl4/hqdefault.jpg",
          width: 480,
          height: 360,
        },
      },
      channelTitle: "JJ Medicine",
      liveBroadcastContent: "none",
      publishTime: "2018-02-14T16:30:15Z",
    },
  },
  {
    kind: "youtube#searchResult",
    etag: "baf_M4b_MvN0cr7npDSJt_p15TE",
    id: {
      kind: "youtube#video",
      videoId: "v-PkFONgiGI",
    },
    snippet: {
      publishedAt: "2020-10-14T12:00:12Z",
      channelId: "UCVQcOvt0I61Xgew_EtlYSXA",
      title:
        "Progression of Liver Disease Webcast Series: Stages of Liver Disease",
      description:
        "In the second installment of our three part Liver Awareness month webcast series, Dr. Al Khalloufi from Cleveland Clinic ...",
      thumbnails: {
        default: {
          url: "https://i.ytimg.com/vi/v-PkFONgiGI/default.jpg",
          width: 120,
          height: 90,
        },
        medium: {
          url: "https://i.ytimg.com/vi/v-PkFONgiGI/mqdefault.jpg",
          width: 320,
          height: 180,
        },
        high: {
          url: "https://i.ytimg.com/vi/v-PkFONgiGI/hqdefault.jpg",
          width: 480,
          height: 360,
        },
      },
      channelTitle: "American Liver Foundation",
      liveBroadcastContent: "none",
      publishTime: "2020-10-14T12:00:12Z",
    },
  },
  {
    kind: "youtube#searchResult",
    etag: "-X2fyhvHlu0Cxw0bGuhqsCXnCW8",
    id: {
      kind: "youtube#video",
      videoId: "R4OG0wHkPcM",
    },
    snippet: {
      publishedAt: "2020-12-01T01:00:07Z",
      channelId: "UC6QYFutt9cluQ3uSM963_KQ",
      title: "Hepatitis | Pathophysiology of Viral Hepatitis",
      description:
        "Official Ninja Nerd Website: https://ninjanerd.org Ninja Nerds! In this lecture Professor Zach Murphy will be teaching you about the ...",
      thumbnails: {
        default: {
          url: "https://i.ytimg.com/vi/R4OG0wHkPcM/default.jpg",
          width: 120,
          height: 90,
        },
        medium: {
          url: "https://i.ytimg.com/vi/R4OG0wHkPcM/mqdefault.jpg",
          width: 320,
          height: 180,
        },
        high: {
          url: "https://i.ytimg.com/vi/R4OG0wHkPcM/hqdefault.jpg",
          width: 480,
          height: 360,
        },
      },
      channelTitle: "Ninja Nerd",
      liveBroadcastContent: "none",
      publishTime: "2020-12-01T01:00:07Z",
    },
  },
  {
    kind: "youtube#searchResult",
    etag: "bKDOvJQR8h8YtyCd-qg27TaKbuI",
    id: {
      kind: "youtube#video",
      videoId: "b8YIRhZXCE0",
    },
    snippet: {
      publishedAt: "2022-04-22T12:00:17Z",
      channelId: "UCuM4pbbbHYKPwKtpJ0vKnKg",
      title: "Liver Function Tests (LFTs) interpretation | COMPLETE GUIDE",
      description:
        "From a Junior Doctor, for Medical Students. Everything you need to know about LFTs blood test! Please consider subscribing and ...",
      thumbnails: {
        default: {
          url: "https://i.ytimg.com/vi/b8YIRhZXCE0/default.jpg",
          width: 120,
          height: 90,
        },
        medium: {
          url: "https://i.ytimg.com/vi/b8YIRhZXCE0/mqdefault.jpg",
          width: 320,
          height: 180,
        },
        high: {
          url: "https://i.ytimg.com/vi/b8YIRhZXCE0/hqdefault.jpg",
          width: 480,
          height: 360,
        },
      },
      channelTitle: "Medicine Made Simple",
      liveBroadcastContent: "none",
      publishTime: "2022-04-22T12:00:17Z",
    },
  },
  {
    kind: "youtube#searchResult",
    etag: "kFY1G5UrA-ZKN4jGsJ573j3c5s0",
    id: {
      kind: "youtube#video",
      videoId: "sgpYvuLZsxI",
    },
    snippet: {
      publishedAt: "2022-07-13T10:00:12Z",
      channelId: "UCuhd3DUTORih99iF0KndvgA",
      title: "Can Liver Cirrhosis be cured? | Symptoms and Treatment explained",
      description:
        "You must be wondering if Liver Cirrhosis is treatable and what are the stages of this condition? How to prevent it from worsening?",
      thumbnails: {
        default: {
          url: "https://i.ytimg.com/vi/sgpYvuLZsxI/default.jpg",
          width: 120,
          height: 90,
        },
        medium: {
          url: "https://i.ytimg.com/vi/sgpYvuLZsxI/mqdefault.jpg",
          width: 320,
          height: 180,
        },
        high: {
          url: "https://i.ytimg.com/vi/sgpYvuLZsxI/hqdefault.jpg",
          width: 480,
          height: 360,
        },
      },
      channelTitle: "SG Dr. Wellness",
      liveBroadcastContent: "none",
      publishTime: "2022-07-13T10:00:12Z",
    },
  },
  {
    kind: "youtube#searchResult",
    etag: "2LRzWBWSHQznRaWj0e1RuJokQ2E",
    id: {
      kind: "youtube#video",
      videoId: "ljqkjasTmQE",
    },
    snippet: {
      publishedAt: "2022-05-20T20:08:11Z",
      channelId: "UC8fQzKHIhSoZeSq3bwQx4mw",
      title: "Mayo Clinic Explains Cirrhosis",
      description:
        "Learning about cirrhosis can be intimidating. Let our experts walk you through the facts, the questions, and the answers to help ...",
      thumbnails: {
        default: {
          url: "https://i.ytimg.com/vi/ljqkjasTmQE/default.jpg",
          width: 120,
          height: 90,
        },
        medium: {
          url: "https://i.ytimg.com/vi/ljqkjasTmQE/mqdefault.jpg",
          width: 320,
          height: 180,
        },
        high: {
          url: "https://i.ytimg.com/vi/ljqkjasTmQE/hqdefault.jpg",
          width: 480,
          height: 360,
        },
      },
      channelTitle: "Mayo Clinic",
      liveBroadcastContent: "none",
      publishTime: "2022-05-20T20:08:11Z",
    },
  },
  {
    kind: "youtube#searchResult",
    etag: "qBzqP1VuQSmBW4brR1cRxFfxDrY",
    id: {
      kind: "youtube#video",
      videoId: "16sPsBgf8O0",
    },
    snippet: {
      publishedAt: "2013-12-19T17:41:02Z",
      channelId: "UCvrrpNGZ_WUWW4-jtXtbUCA",
      title: "Liver Disease - Hepatitis Risk Factors",
      description:
        "In this video Dr. Robert Brown, Professor of Medicine and Surgery at Columbia, describes the risk factors for both hepatitis B and ...",
      thumbnails: {
        default: {
          url: "https://i.ytimg.com/vi/16sPsBgf8O0/default.jpg",
          width: 120,
          height: 90,
        },
        medium: {
          url: "https://i.ytimg.com/vi/16sPsBgf8O0/mqdefault.jpg",
          width: 320,
          height: 180,
        },
        high: {
          url: "https://i.ytimg.com/vi/16sPsBgf8O0/hqdefault.jpg",
          width: 480,
          height: 360,
        },
      },
      channelTitle: "Columbia University Department of Surgery",
      liveBroadcastContent: "none",
      publishTime: "2013-12-19T17:41:02Z",
    },
  },
];
