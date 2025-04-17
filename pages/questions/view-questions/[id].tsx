import ViewQuestionCardContainer from "@/@modules/questions/ViewQuestionCardContainer";
import AppHead from "@/@shared/components/AppHead";
import { Pagination } from "@/@shared/components/Pagination/Pagination";
import Button from "@/@shared/ui/Button";
import ErrorMessage from "@/@shared/ui/ErrorMessage/ErrorMessage";
import { useGetQuestionSummariesQuery } from "@/api-services/questions.service";
import {
  useGetAllUserDocumentsQuery,
  useGetDocumentSummaryQuery,
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
import { RootState } from "@/config/redux-config";
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

  //Discussion tab logic

  const [lastMessageCreatedOn, setLastMessageCreatedOn] = useState<Date>();
  const { data: initialMessages, isError: isLoadingMessagesError } =
    useGetDocumentMessagesQuery(
      {
        courseDocumentId: documentId,
        limit: 4,
      },
      {
        skip: !documentId,
        refetchOnMountOrArgChange: true,
      }
    );
  const { data: previousMessagesData } = useGetDocumentMessagesQuery(
    {
      courseDocumentId: documentId,
      limit: 4,
      lastMessageCreatedOn,
    },
    {
      skip: !lastMessageCreatedOn,
      refetchOnMountOrArgChange: true,
    }
  );

  const [initialMessagesOnRender, setInitialMessagesOnRender] = useState<
    { message: string; sender: string }[]
  >([]);

  const [currentMessages, setCurrentMessages] = useState<
    { message: string; sender: string }[]
  >([]);

  const [previousMessages, setPreviousMessages] = useState<
    { message: string; sender: string }[]
  >([]);

  const [showFetchPreviousMessagesButton, setShowPreviousMessagesButton] =
    useState(false);

  const [initialMessagesFetched, setInitialMessagesFetched] = useState(false);

  const handleFetchMorePreviousMessages = () => {
    let totalMessagesInDatabase = 0;
    const totalMessagesOnClient =
      currentMessages.length + previousMessages.length;

    if (previousMessagesData) {
      totalMessagesInDatabase = previousMessagesData.count;
      if (totalMessagesInDatabase > totalMessagesOnClient) {
        setLastMessageCreatedOn(previousMessagesData.data[0].createdOn);
      }
    }

    if (!previousMessagesData && initialMessages) {
      totalMessagesInDatabase = initialMessages.count;
      if (totalMessagesInDatabase > totalMessagesOnClient) {
        setLastMessageCreatedOn(initialMessages.data[0].createdOn);
      }
    }
  };

  const handleAppendNewMessage = (
    message: string,
    sender: "user" | "system"
  ) => {
    setCurrentMessages([...currentMessages, { message, sender }]);
  };

  /*  clear and set initial messages **/
  useEffect(() => {
    setPreviousMessages([]);
    setInitialMessagesOnRender([]);
    if (initialMessages) {
      setInitialMessagesFetched(true);
      const messages = initialMessages.data.map((d) => ({
        message: d.message,
        sender: d.sender,
      }));
      setInitialMessagesOnRender(messages);
    }
  }, [initialMessages]);

  // set the previousMessages
  useEffect(() => {
    if (previousMessagesData) {
      const messages = previousMessagesData.data.map((d) => ({
        message: d.message,
        sender: d.sender,
      }));

      setPreviousMessages([...previousMessages, ...messages]);
    }
  }, [previousMessagesData]);

  /* this handles whether or not to show the 
  fetch previous messages button
  **/
  const handleCanFetchPreviousMessages = () => {
    let totalMessagesInDatabase = 0;

    if (previousMessagesData) {
      totalMessagesInDatabase = previousMessagesData.count;
    }

    if (!previousMessagesData && initialMessages) {
      totalMessagesInDatabase = initialMessages.count;
    }

    const totalMessagesOnClient =
      currentMessages.length +
      previousMessages.length +
      initialMessagesOnRender.length;

    if (totalMessagesInDatabase > totalMessagesOnClient) {
      setShowPreviousMessagesButton(true);
    } else {
      setShowPreviousMessagesButton(false);
    }
  };

  useEffect(() => {
    handleCanFetchPreviousMessages();
  }, [
    initialMessages,
    previousMessagesData,
    JSON.stringify(previousMessages),
    JSON.stringify(currentMessages),
  ]);

  // tabs

  const [activeTab, setActiveTab] = useState("Questions");
  const [tabs, setTabs] = useState(["Questions", "Summary"]);

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

  return (
    <>
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
          {permissions && activeTab === "Questions" && (
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
