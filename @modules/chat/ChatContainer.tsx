import React, { FC, useEffect, useState } from "react";
import NewMessageContainer from "./NewMessageContainer";
import UserMessage from "./UserMessage";
import SystemMessage from "./SystemMessage";
import {
  useGetDocumentMessagesQuery,
  useSendMessageMutation,
} from "@/api-services/document-message.service";

interface Props {
  documentId: string;
}

const ChatContainer: FC<Props> = ({ documentId }) => {
  const { data } = useGetDocumentMessagesQuery({
    courseDocumentId: documentId,
    limit: 10,
  });

  const [currentMessages, setCurrentMessages] = useState<
    { message: string; sender: string }[]
  >([]);

  const [previousMessages, setPreviousMessages] = useState<
    { message: string; sender: string }[]
  >([]);

  useEffect(() => {
    if (data) {
      const messages = data.data.map((d) => ({
        message: d.message,
        sender: d.sender,
      }));
      setPreviousMessages([...previousMessages, ...messages]);
    }
  }, [data]);

  const [sendMessage, { data: newSystemMessage }] = useSendMessageMutation();

  useEffect(() => {
    if (newSystemMessage) {
      setCurrentMessages([
        ...currentMessages,
        { message: newSystemMessage.message, sender: "system" },
      ]);
    }
  }, [newSystemMessage]);

  return (
    <>
      <section className="bg-[#FAFAFA] h-[calc(100vh-230px)] pt-10 px-14 max-md:px-6 pb-8 overflow-y-auto w-full rounded-xl">
        <div className="flex flex-col h-auto min-h-[calc(100vh-305px)] justify-end gap-12">
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
        </div>
      </section>
      <NewMessageContainer
        handleSendMessage={(message) => {
          setCurrentMessages([...currentMessages, { message, sender: "user" }]);
          sendMessage({ courseDocumentId: documentId, message });
        }}
      />
    </>
  );
};

export default ChatContainer;
