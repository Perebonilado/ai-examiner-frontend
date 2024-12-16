import React, { ElementRef, FC, useEffect, useRef, useState } from "react";
import NewMessageContainer from "./NewMessageContainer";
import UserMessage from "./UserMessage";
import SystemMessage from "./SystemMessage";
import {
  useGetDocumentMessagesQuery,
  useSendMessageMutation,
} from "@/api-services/document-message.service";
import Spinner from "@/@shared/components/Spinner";
import NoMessageInfo from "./NoMessageInfo";
import { toast } from "react-toastify";
import Button from "@/@shared/ui/Button";
import ErrorMessage from "@/@shared/ui/ErrorMessage/ErrorMessage";
import FilterIcon from "@/icons/FilterIcon";
import IconButton from "@/@shared/ui/IconButton";
import { useModalContext } from "@/contexts/ModalContext";
import ResponseFormatDialog from "./ResponseFormatDialog";
import { useRouter } from "next/router";

interface Props {
  documentId: string;
  documentTitle: string;
  initialMessagesFetched: boolean;
  handleAppendNewMessage: (message: string, sender: "system" | "user") => void;
  currentMessages: { message: string; sender: string }[];
  previousMessages: { message: string; sender: string }[];
  initialMessages: { message: string; sender: string }[];
  showFetchPreviousMessagesButton: boolean;
  handleFetchMorePreviousMessages: () => void;
  isLoadingMessagesError: boolean;
}

const ChatContainer: FC<Props> = ({
  documentId,
  documentTitle,
  handleAppendNewMessage,
  currentMessages,
  previousMessages,
  initialMessages,
  showFetchPreviousMessagesButton,
  isLoadingMessagesError,
  handleFetchMorePreviousMessages,
  initialMessagesFetched,
}) => {
  const chatContainerRef = useRef<ElementRef<"section">>(null);

  const [sendMessage, { data: newSystemMessage, isLoading, isError, error }] =
    useSendMessageMutation();

  const { setModalContent } = useModalContext();

  const [selectedResponseFormat, setSelectedResponseFormat] =
    useState("indepth");

  const handleInitializeResponseFormatModal = () => {
    setModalContent(
      <ResponseFormatDialog
        defaultSelectedOption={selectedResponseFormat}
        handleSelectedOption={(selectedOption) => {
          setSelectedResponseFormat(selectedOption);
        }}
      />
    );
  };

  useEffect(() => {
    if (error && "status" in error) {
      if ("data" in error) {
        const { message } = error.data as { message: string };
        toast.error(message);
      } else toast.error("Oops! Something went wrong");
    }
  }, [error]);

  useEffect(() => {
    if (newSystemMessage) {
      handleAppendNewMessage(newSystemMessage.message, "system");
      scrollToBottomOfChat();
    }
  }, [newSystemMessage]);

  const scrollToBottomOfChat = () => {
    if (chatContainerRef.current) {
      // Using setTimeout to wait for the new message to render before scrolling
      setTimeout(() => {
        chatContainerRef.current!.scrollTop =
          chatContainerRef.current?.scrollHeight || 0;
      }, 50);
    }
  };

  const handleRetryOnError = () => {
    const lastUserMessage = currentMessages[currentMessages.length - 1].message;
    sendMessage({
      courseDocumentId: documentId,
      message: lastUserMessage,
      responseFormat: selectedResponseFormat,
    });
  };

  const handleSendMessage = (message: string) => {
    handleAppendNewMessage(message, "user");
    scrollToBottomOfChat();

    sendMessage({
      courseDocumentId: documentId,
      message,
      responseFormat: selectedResponseFormat,
    });
  };

  const router = useRouter();

  useEffect(() => {
    const { question, tab } = router.query;

    if (question && typeof question === "string" && initialMessagesFetched) {
      handleSendMessage(question);
      router.push(
        `/questions/view-questions/${documentId}?tab=${tab || ""}`,
        undefined,
        {
          shallow: true,
        }
      );
    }
  }, [router.query, initialMessagesFetched]);

  return (
    <div className="relative w-full max-w-screen-md mx-auto">
      {/* <div className="absolute right-3 top-2 z-40">
        <IconButton
          icon={<FilterIcon />}
          size="small"
          onClick={handleInitializeResponseFormatModal}
        />
      </div> */}
      <section
        ref={chatContainerRef}
        className="bg-[#FAFAFA] relative h-[calc(100vh-330px)] pt-10 px-14 max-md:px-4 pb-8 overflow-y-auto w-full rounded-xl"
      >
        {!initialMessages.length && !currentMessages.length && (
          <NoMessageInfo documentTitle={documentTitle} />
        )}
        <div className="flex flex-col h-auto min-h-[calc(100vh-410px)] justify-end gap-12">
          {showFetchPreviousMessagesButton && (
            <div className="flex justify-center items-center">
              <Button
                title="Fetch previous messages"
                variant="text"
                size="small"
                onClick={handleFetchMorePreviousMessages}
              />
            </div>
          )}
          {previousMessages.map((m, idx) => {
            if (m.sender === "system") {
              return <SystemMessage message={m.message} key={idx} />;
            }

            return <UserMessage message={m.message} key={idx} />;
          })}
          {initialMessages.map((m, idx) => {
            if (m.sender === "system") {
              return <SystemMessage message={m.message} key={idx} />;
            }

            return <UserMessage message={m.message} key={idx} />;
          })}
          {currentMessages.map((m, idx) => {
            if (m.sender === "system") {
              return <SystemMessage message={m.message} key={idx} />;
            }

            return <UserMessage message={m.message} key={idx} />;
          })}
          {isLoading && (
            <div className="flex flex-col items-center justify-center my-4">
              <Spinner size="sm" />
              <p className="text-center text-sm mt-2">
                AI Examiner is thinking...
              </p>
            </div>
          )}

          {/* if there is an error and the last message was a user message */}
          {isError &&
            currentMessages.length &&
            currentMessages[currentMessages.length - 1].sender === "user" && (
              <div className="flex flex-col gap-2 items-center justify-center my-4">
                <p>Oops! My bad, let's try that again</p>
                <Button
                  title="Retry"
                  size="small"
                  variant="outlined"
                  onClick={handleRetryOnError}
                />
              </div>
            )}

          {isLoadingMessagesError && (
            <div className="flex flex-col gap-2 items-center justify-center my-4">
              <ErrorMessage message="We encountered an issue fetching your previous messages" />
              <Button title="Reload" size="small" variant="outlined" />
            </div>
          )}
        </div>
      </section>
      <NewMessageContainer
        chatDisabled={isLoading || isLoadingMessagesError}
        documentTitle={documentTitle}
        handleSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default ChatContainer;
