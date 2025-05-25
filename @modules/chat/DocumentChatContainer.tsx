import React, { FC, PropsWithChildren, useEffect, useState } from "react";
import DocumentChatIcon from "./DocumentChatIcon";
import DocumentChatMessagesContainer from "./DocumentChatMessagesContainer";
import { useDispatch, useSelector } from "react-redux";
import {
  appendNewMessage,
  clearMessages,
  ImageDescription,
  MessageItem,
  setHighlightToPrompt,
  setImageDescription,
  setIsChatOpen,
  setMessages,
  setNotSureMessage,
  setNotSureQuestion,
  setTotalMessagesInDb,
} from "@/features/documentChatSlice";
import { useRouter } from "next/router";
import { routesWithDocumentChat } from "@/constants";
import { reduxStore, RootState } from "@/config/redux-config";
import { toast } from "react-toastify";
import { DocumentMessageService } from "@/api-services/document-message.service";
import { NotSureQuestion } from "@/models/questions.model";
import { HighlightToPrompt } from "@/models/document-message.model";

const DocumentChatContainer: FC<PropsWithChildren> = ({ children }) => {
  const dispatch = useDispatch();
  const route = useRouter();
  const [showDocChat, setShowDocChat] = useState(false);
  const {
    documentIdInView,
    messages,
    totalMessagesInDb,
    isChatOpen,
    notSureMessage,
    notSureQuestion,
    highlightToPrompt,
    imageDescription,
  } = useSelector((state: RootState) => state.documentChatReducer);

  useEffect(() => {
    if (notSureMessage.trim().length) {
      dispatch(
        appendNewMessage({
          createdOn: new Date().toString() as unknown as Date,
          id: new Date().getTime().toString(),
          message: notSureMessage,
          sender: "user",
        })
      );

      getSystemResponse(notSureMessage, notSureQuestion || undefined);

      setTimeout(() => {
        dispatch(setNotSureMessage(""));
        dispatch(setNotSureQuestion(null));
      }, 100);
    }
  }, [notSureMessage, notSureQuestion]);

  useEffect(() => {
    if (highlightToPrompt) {
      const question = `${highlightToPrompt.highlight} - ${highlightToPrompt.question}`;
      dispatch(
        appendNewMessage({
          createdOn: new Date().toString() as unknown as Date,
          id: new Date().getTime().toString(),
          message: question,
          sender: "user",
        })
      );

      getSystemResponse(question, undefined, highlightToPrompt);

      setTimeout(() => {
        dispatch(setHighlightToPrompt(null));
      }, 100);
    }
  }, [highlightToPrompt]);

  useEffect(() => {
    if (imageDescription) {
      const question = `Tell me more about this image`;
      dispatch(
        appendNewMessage({
          createdOn: new Date().toString() as unknown as Date,
          id: new Date().getTime().toString(),
          message: question,
          sender: "user",
          image: imageDescription.image,
        })
      );

      getSystemResponse(
        imageDescription.searchPhrase,
        undefined,
        undefined,
        imageDescription
      );

      setTimeout(() => {
        dispatch(setImageDescription(null));
      }, 100);
    }
  }, [imageDescription]);

  const limit = 4;
  const [isFetchingMessages, setIsFetchingMessages] = useState(false);
  const [isAwaitingSystemResponse, setIsAwaitingSystemResponse] =
    useState(false);
  const [systemResponseError, setSystemResponseError] = useState(false);

  const fetchMessages = async (
    documentId: string,
    lastMessageCreatedOn?: Date,
    resetMessages = false
  ) => {
    try {
      setIsFetchingMessages(true);
      const data = await reduxStore.dispatch(
        DocumentMessageService.endpoints.getDocumentMessages.initiate({
          courseDocumentId: documentId,
          limit,
          lastMessageCreatedOn,
        })
      );

      if (data.error) {
        setIsAwaitingSystemResponse(false);
        setSystemResponseError(true);
        toast.error("Error fetching chat messages");
      }

      if (data.data?.data.length) {
        const newMessages = data.data?.data.map((item) => {
          return {
            message: item.message,
            sender: item.sender,
            id: item.id,
            createdOn: item.createdOn,
          } as MessageItem;
        });
        dispatch(setTotalMessagesInDb(data.data.count));
        if (resetMessages) {
          dispatch(setMessages([...newMessages]));
        } else {
          dispatch(setMessages([...newMessages, ...messages]));
        }
      }
      setIsFetchingMessages(false);
    } catch (error) {
      setIsFetchingMessages(false);
      toast.error("Error fetching chat");
    }
  };

  const getSystemResponse = async (
    message: string,
    notSureQuestionToBeSent?: NotSureQuestion,
    highlightToPrompt?: HighlightToPrompt,
    imageDescription?: ImageDescription
  ) => {
    try {
      setSystemResponseError(false);
      setIsAwaitingSystemResponse(true);
      const data = await reduxStore.dispatch(
        DocumentMessageService.endpoints.sendMessage.initiate({
          message,
          courseDocumentId: documentIdInView,
          responseFormat: "indepth",
          notSureQuestion: notSureQuestionToBeSent || undefined,
          highlightToPrompt: highlightToPrompt || undefined,
          imageDescriptionData: imageDescription
            ? { imageUrl: imageDescription.image }
            : undefined,
        })
      );
      const systemResponse = data.data?.message;
      setIsAwaitingSystemResponse(false);
      if (systemResponse) {
        dispatch(
          appendNewMessage({
            createdOn: new Date().toString() as unknown as Date,
            id: new Date().getTime().toString(),
            message: systemResponse,
            sender: "system",
          })
        );
      }
    } catch (error) {
      setIsAwaitingSystemResponse(false);
      setSystemResponseError(true);

      toast.error("Error getting response");
    }
  };

  useEffect(() => {
    if (documentIdInView) {
      fetchMessages(documentIdInView, undefined, true);
    }
  }, [documentIdInView]);

  useEffect(() => {
    const routeValidForDocumentChat = routesWithDocumentChat.some((r) => {
      return route.pathname.includes(r);
    });

    if (routeValidForDocumentChat) {
      setShowDocChat(true);
    } else {
      setShowDocChat(false);
      dispatch(setIsChatOpen(false));
    }

    return () => {
      setShowDocChat(false);
      dispatch(setIsChatOpen(false));
    };
  }, [route.pathname]);

  return (
    <>
      {children}
      {showDocChat && (
        <DocumentChatIcon
          handleOpenChat={() => {
            dispatch(setIsChatOpen(true));
          }}
        />
      )}
      {showDocChat && (
        <DocumentChatMessagesContainer
          isAwaitingSystemResponse={isAwaitingSystemResponse}
          isSendingMessageError={systemResponseError}
          handleRetrySendingMessage={() => {
            const mostRecentMessage = messages[messages.length - 1];
            getSystemResponse(mostRecentMessage.message);
          }}
          handleFetchOlderMessages={() => {
            if (totalMessagesInDb > messages.length) {
              const lastMessageIndex = 0;
              if (
                messages[lastMessageIndex]?.createdOn &&
                !isFetchingMessages
              ) {
                fetchMessages(
                  documentIdInView,
                  messages[lastMessageIndex].createdOn
                );
              }
            }
          }}
          sendMessage={(message) => {
            dispatch(
              appendNewMessage({
                message,
                sender: "user",
                createdOn: String(new Date()) as unknown as Date,
                id: new Date().getTime().toString(),
              })
            );

            getSystemResponse(message);
          }}
        />
      )}
    </>
  );
};

export default DocumentChatContainer;
