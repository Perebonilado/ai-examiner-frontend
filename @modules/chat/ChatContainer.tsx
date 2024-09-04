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

interface Props {
  documentId: string;
  documentTitle: string;
}

interface SearchParams {
  lastMessageCreatedOn?: Date;
  courseDocumentId: string;
  limit: number;
}

const ChatContainer: FC<Props> = ({ documentId, documentTitle }) => {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    courseDocumentId: documentId,
    limit: 4,
  });
  const { data, isError: isLoadingMessagesError } =
    useGetDocumentMessagesQuery(searchParams);

  const [currentMessages, setCurrentMessages] = useState<
    { message: string; sender: string }[]
  >([]);

  const [previousMessages, setPreviousMessages] = useState<
    { message: string; sender: string }[]
  >([]);

  const [showFetchPreviousMessagesButton, setShowPreviousMessagesButton] =
    useState(false);

  const chatContainerRef = useRef<ElementRef<"section">>(null);

  const [sendMessage, { data: newSystemMessage, isLoading, isError, error }] =
    useSendMessageMutation();

  const handleFetchMorePreviousMessages = () => {
    if (data) {
      const totalMessagesInDatabase = data.count;
      const totalMessagesOnClient =
        currentMessages.length + previousMessages.length;

      if (totalMessagesInDatabase > totalMessagesOnClient) {
        const params: SearchParams = {
          ...searchParams,
          lastMessageCreatedOn: data.data[0].createdOn,
        };

        setSearchParams(params);
      }
    }
  };

  useEffect(() => {
    if (data) {
      const totalMessagesInDatabase = data.count;
      const totalMessagesOnClient =
        currentMessages.length + previousMessages.length;

      if (totalMessagesInDatabase > totalMessagesOnClient) {
        setShowPreviousMessagesButton(true);
      } else {
        setShowPreviousMessagesButton(false);
      }
    }
  }, [data, JSON.stringify(previousMessages), JSON.stringify(currentMessages)]);

  useEffect(() => {
    if (error && "status" in error) {
      if ("data" in error) {
        const { message } = error.data as { message: string };
        toast.error(message);
      } else toast.error("Oops! Something went wrong");
    }
  }, [error]);

  useEffect(() => {
    if (data) {
      const messages = data.data.map((d) => ({
        message: d.message,
        sender: d.sender,
      }));
      setPreviousMessages([ ...messages, ...previousMessages]);
      scrollToBottomOfChat();
    }
  }, [data]);

  useEffect(() => {
    if (newSystemMessage) {
      setCurrentMessages([
        ...currentMessages,
        { message: newSystemMessage.message, sender: "system" },
      ]);
      scrollToBottomOfChat();
    }
  }, [newSystemMessage]);

  const scrollToBottomOfChat = () => {
    if (chatContainerRef.current) {
      // Using setTimeout to wait for the new message to render before scrolling
      setTimeout(() => {
        chatContainerRef.current!.scrollTop =
          chatContainerRef.current!.scrollHeight;
      }, 0);
    }
  };

  const handleRetryOnError = () => {
    const lastUserMessage = currentMessages[currentMessages.length - 1].message;
    sendMessage({ courseDocumentId: documentId, message: lastUserMessage });
  };

  return (
    <>
      <section
        ref={chatContainerRef}
        className="bg-[#FAFAFA] relative h-[calc(100vh-330px)] pt-10 px-14 max-md:px-4 pb-8 overflow-y-auto w-full rounded-xl"
      >
        {!previousMessages.length && !currentMessages.length && (
          <NoMessageInfo documentTitle={documentTitle}/>
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
          {previousMessages.map((m) => {
            if (m.sender === "system") {
              return <SystemMessage message={m.message} />;
            }

            return <UserMessage message={m.message} />;
          })}
          {currentMessages.map((m) => {
            if (m.sender === "system") {
              return <SystemMessage message={m.message} />;
            }

            return <UserMessage message={m.message} />;
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
        handleSendMessage={(message) => {
          setCurrentMessages([...currentMessages, { message, sender: "user" }]);
          scrollToBottomOfChat();

          sendMessage({ courseDocumentId: documentId, message });
        }}
      />
    </>
  );
};

export default ChatContainer;
