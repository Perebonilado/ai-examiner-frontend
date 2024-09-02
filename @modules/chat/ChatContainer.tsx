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

const ChatContainer: FC<Props> = ({ documentId, documentTitle }) => {
  const { data, isError: isLoadingMessagesError } = useGetDocumentMessagesQuery(
    {
      courseDocumentId: documentId,
      limit: 10,
    }
  );

  const [currentMessages, setCurrentMessages] = useState<
    { message: string; sender: string }[]
  >([]);

  const [previousMessages, setPreviousMessages] = useState<
    { message: string; sender: string }[]
  >([]);

  const chatContainerRef = useRef<ElementRef<"section">>(null);

  const [sendMessage, { data: newSystemMessage, isLoading, isError, error }] =
    useSendMessageMutation();

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
      setPreviousMessages([...previousMessages, ...messages]);
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
          <NoMessageInfo />
        )}
        <div className="flex flex-col h-auto min-h-[calc(100vh-410px)] justify-end gap-12">
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
