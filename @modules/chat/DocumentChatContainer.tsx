import React, {
  FC,
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import DocumentChatIcon from "./DocumentChatIcon";
import DocumentChatMessagesContainer from "./DocumentChatMessagesContainer";
import { useDispatch, useSelector } from "react-redux";
import {
  appendNewMessage,
  appendToMessage,
  ImageDescription,
  MessageItem,
  removeMessage,
  requestPage,
  setHighlightToPrompt,
  setImageDescription,
  setIsChatOpen,
  setMessages,
  setNotSureMessage,
  setNotSureQuestion,
  setTotalMessagesInDb,
  updateMessage,
} from "@/features/documentChatSlice";
import { useRouter } from "next/router";
import { routesWithDocumentChat } from "@/constants";
import { reduxStore, RootState } from "@/config/redux-config";
import { toast } from "react-toastify";
import { DocumentMessageService } from "@/api-services/document-message.service";
import {
  ChatStreamError,
  StreamPayload,
  streamDocumentMessage,
} from "@/api-services/document-message-stream";
import { NotSureQuestion } from "@/models/questions.model";
import { HighlightToPrompt } from "@/models/document-message.model";
import { getUserLanguageCodeFromLocalStorage, logout } from "@/utils";
import { createTextBatcher } from "./chatStreamUtils";

/** What a question was sent with, so a failed reply can be retried exactly. */
interface SendArgs {
  message: string;
  notSureQuestion?: NotSureQuestion;
  highlightToPrompt?: HighlightToPrompt;
  imageDescription?: ImageDescription;
}

let localCount = 0;
const localId = (kind: "question" | "reply") =>
  `local-${kind}-${Date.now()}-${++localCount}`;
const now = () => new Date().toString() as unknown as Date;
const PHONE_QUERY = "(max-width: 767px)";
const MAX_HIGHLIGHT_CHARS = 4000;

const DocumentChatContainer: FC<PropsWithChildren> = ({ children }) => {
  const dispatch = useDispatch();
  const route = useRouter();
  const [showDocChat, setShowDocChat] = useState(false);
  const {
    documentIdInView,
    messages,
    totalMessagesInDb,
    notSureMessage,
    notSureQuestion,
    highlightToPrompt,
    imageDescription,
  } = useSelector((state: RootState) => state.documentChatReducer);

  const limit = 4;
  const [isFetchingMessages, setIsFetchingMessages] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  /** The reply being written, so it can be stopped. */
  const activeRef = useRef<{ controller: AbortController; replyId: string } | null>(
    null
  );
  const sentWithRef = useRef(new Map<string, SendArgs>());

  const findMessage = (id: string) =>
    reduxStore
      .getState()
      .documentChatReducer.messages.find((m: MessageItem) => m.id === id);

  /** The backend has no streaming endpoint yet: ask the JSON one and show the reply at once. */
  const replyWithoutStreaming = async (payload: StreamPayload, replyId: string) => {
    const { language, retry, ...body } = payload;
    const result = await reduxStore.dispatch(
      DocumentMessageService.endpoints.sendMessage.initiate(body)
    );
    const text = "data" in result ? result.data?.message : undefined;
    dispatch(
      updateMessage({
        id: replyId,
        changes: text
          ? { message: text, status: "done", phase: undefined }
          : { status: "error", phase: undefined },
      })
    );
  };

  const getSystemResponse = async (args: SendArgs, retry = false) => {
    const documentId = reduxStore.getState().documentChatReducer.documentIdInView;
    if (!documentId) {
      // The page hasn't said which document this is yet: show the error (with Retry) rather than nothing.
      const replyId = localId("reply");
      sentWithRef.current.set(replyId, args);
      dispatch(
        appendNewMessage({
          id: replyId,
          sender: "system",
          message: "",
          status: "error",
          createdOn: now(),
        })
      );
      return;
    }

    // A highlight or practice question can arrive while a reply is still being written:
    // stop that one (it keeps what it wrote) and answer the new one.
    activeRef.current?.controller.abort();

    const replyId = localId("reply");
    const controller = new AbortController();
    activeRef.current = { controller, replyId };
    sentWithRef.current.set(replyId, args);
    setIsReplying(true);
    dispatch(
      appendNewMessage({
        id: replyId,
        sender: "system",
        message: "",
        status: "streaming",
        phase: "reading",
        createdOn: now(),
      })
    );

    const payload: StreamPayload = {
      message: args.message,
      courseDocumentId: documentId,
      responseFormat: "indepth",
      notSureQuestion: args.notSureQuestion,
      highlightToPrompt: args.highlightToPrompt,
      imageDescriptionData: args.imageDescription
        ? { imageUrl: args.imageDescription.image }
        : undefined,
      language: getUserLanguageCodeFromLocalStorage() || undefined,
      retry: retry || undefined,
    };

    let wrote = false;
    const batcher = createTextBatcher((text) =>
      dispatch(appendToMessage({ id: replyId, text }))
    );

    try {
      const result = await streamDocumentMessage(payload, {
        signal: controller.signal,
        onMeta: (meta) =>
          dispatch(updateMessage({ id: replyId, changes: { pages: meta.pages } })),
        onThinking: () => {
          if (!wrote) {
            dispatch(updateMessage({ id: replyId, changes: { phase: "thinking" } }));
          }
        },
        onDelta: (text) => {
          wrote = true;
          batcher.push(text);
        },
      });
      batcher.flush();
      dispatch(
        updateMessage({
          id: replyId,
          changes:
            result.status === "refused"
              ? { message: result.text ?? "", status: "done", phase: undefined }
              : {
                  status: result.status === "truncated" ? "truncated" : "done",
                  phase: undefined,
                },
        })
      );
    } catch (error) {
      batcher.flush();
      if (controller.signal.aborted) {
        // Stopped: keep what was written; a reply with nothing in it goes.
        if (findMessage(replyId)?.message.trim()) {
          dispatch(
            updateMessage({ id: replyId, changes: { status: "stopped", phase: undefined } })
          );
        } else {
          dispatch(removeMessage(replyId));
        }
      } else if (error instanceof ChatStreamError && error.kind === "unavailable") {
        await replyWithoutStreaming(payload, replyId);
      } else if (error instanceof ChatStreamError && error.kind === "auth") {
        logout(() => {
          window.location.pathname = "/auth/login";
        });
      } else {
        dispatch(
          updateMessage({ id: replyId, changes: { status: "error", phase: undefined } })
        );
      }
    } finally {
      if (activeRef.current?.replyId === replyId) {
        activeRef.current = null;
        setIsReplying(false);
      }
    }
  };

  const askQuestion = (args: SendArgs, shown: string, image?: string) => {
    dispatch(
      appendNewMessage({
        createdOn: now(),
        id: localId("question"),
        message: shown,
        sender: "user",
        image,
      })
    );
    getSystemResponse(args);
  };

  useEffect(() => {
    if (notSureMessage.trim().length) {
      askQuestion(
        { message: notSureMessage, notSureQuestion: notSureQuestion || undefined },
        notSureMessage
      );

      setTimeout(() => {
        dispatch(setNotSureMessage(""));
        dispatch(setNotSureQuestion(null));
      }, 100);
    }
  }, [notSureMessage, notSureQuestion]);

  useEffect(() => {
    if (highlightToPrompt) {
      // The answer only uses the start of a very long selection; keep the message within limits.
      const highlight = {
        ...highlightToPrompt,
        question: highlightToPrompt.question.slice(0, MAX_HIGHLIGHT_CHARS),
      };
      const question = `${highlight.highlight} - ${highlight.question}`;
      askQuestion({ message: question, highlightToPrompt: highlight }, question);

      setTimeout(() => {
        dispatch(setHighlightToPrompt(null));
      }, 100);
    }
  }, [highlightToPrompt]);

  useEffect(() => {
    if (imageDescription) {
      askQuestion(
        { message: imageDescription.searchPhrase, imageDescription },
        "Tell me more about this image",
        imageDescription.image
      );

      setTimeout(() => {
        dispatch(setImageDescription(null));
      }, 100);
    }
  }, [imageDescription]);

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
        toast.error("Error fetching chat messages");
      }

      if (data.data?.data.length) {
        const newMessages = data.data?.data.map((item) => {
          return {
            message: item.message,
            sender: item.sender,
            id: item.id,
            createdOn: item.createdOn,
            image: item?.image,
          } as MessageItem;
        });
        dispatch(setTotalMessagesInDb(data.data.count));
        if (resetMessages) {
          dispatch(setMessages([...newMessages]));
        } else {
          const current = reduxStore.getState().documentChatReducer.messages;
          dispatch(setMessages([...newMessages, ...current]));
        }
      }
      setIsFetchingMessages(false);
    } catch (error) {
      setIsFetchingMessages(false);
      toast.error("Error fetching chat");
    }
  };

  useEffect(() => {
    // A reply about the previous document isn't worth finishing.
    activeRef.current?.controller.abort();
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

  const stopReply = useCallback(() => {
    activeRef.current?.controller.abort();
  }, []);

  const retryReply = (replyId: string) => {
    const args = sentWithRef.current.get(replyId);
    if (!args) return;
    dispatch(removeMessage(replyId));
    getSystemResponse(args, true);
  };

  const goToPage = useCallback(
    (page: number) => {
      dispatch(requestPage(page));
      // On phones the chat covers the page: get out of the way.
      if (window.matchMedia?.(PHONE_QUERY).matches) dispatch(setIsChatOpen(false));
    },
    [dispatch]
  );

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
          isReplying={isReplying}
          onStop={stopReply}
          onRetry={retryReply}
          onPageClick={goToPage}
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
          sendMessage={(message) => askQuestion({ message }, message)}
        />
      )}
    </>
  );
};

export default DocumentChatContainer;
