import React, { FC, useEffect, useRef, useState } from "react";
import CloseIcon from "@/icons/CloseIcon";
import IconButton from "@/@shared/ui/IconButton";
import ArrowUpIcon from "@/icons/ArrowUpIcon";
import UserMessage from "./UserMessage";
import SystemMessage from "./SystemMessage";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/config/redux-config";
import cn from "classnames";
import { setIsChatOpen } from "@/features/documentChatSlice";
import MessageLoader from "./MessageLoader";
import NoMessageInfo from "./NoMessageInfo";
import RetrySendingMessageButton from "./RetrySendingMessageButton";
import CollapseIcon from "@/icons/CollapseIcon";
import ExpandIcon from "@/icons/ExpandIcon";
import { capitalizeFirstLetterOfEachWord } from "@/utils";
import { HighlightableTextArea } from "react-highlight-popover";
import TextSelectionPopup from "@/@shared/components/TextSelectionPopUp";

interface Props {
  handleFetchOlderMessages: () => void;
  sendMessage: (message: string) => void;
  isAwaitingSystemResponse: boolean;
  isSendingMessageError: boolean;
  handleRetrySendingMessage: () => void;
}

const DocumentChatMessagesContainer: FC<Props> = ({
  handleFetchOlderMessages,
  handleRetrySendingMessage,
  isAwaitingSystemResponse,
  isSendingMessageError,
  sendMessage,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto"; // Reset
      el.style.height = `${Math.min(el.scrollHeight, 200)}px`; // Max 200px
    }
  };

  const { isChatOpen, messages, documentTitleInView } = useSelector(
    (state: RootState) => state.documentChatReducer
  );
  const [isExpanded, setIsExpanded] = useState(false);

  const rootClassName = cn(
    `fixed bottom-0 border w-full min-h-[60vh] z-[5000] bg-slate-100 rounded-t-xl shadow-2xl p-4 
      max-sm:max-w-[95%] max-sm:left-1/2 max-sm:-translate-x-1/2 flex flex-col 
      transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]`,
    {
      "translate-y-[100%]": !isChatOpen,
      "translate-y-0": isChatOpen,
      "max-h-[70vh] max-w-[400px] sm:right-4": !isExpanded,
      "max-h-[85vh] max-w-[900px] right-0 left-1/2 -translate-x-1/2":
        isExpanded,
    }
  );

  const dispatch = useDispatch();

  const [message, setMessage] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isChatOpen)
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [isChatOpen]);

  const [showLoader, setShowLoader] = useState(false);

  let timer: NodeJS.Timeout;

  useEffect(() => {
    if (isAwaitingSystemResponse) {
      timer = setTimeout(() => setShowLoader(true), 550);
    } else {
      clearTimeout(timer);
      setShowLoader(false);
    }

    return () => clearTimeout(timer);
  }, [isAwaitingSystemResponse]);

  const getFooterElement = () => {
    if (!messages.length) {
      return (
        <NoMessageInfo
          documentTitle={capitalizeFirstLetterOfEachWord(documentTitleInView)}
        />
      );
    }

    if (showLoader) {
      return <MessageLoader />;
    }

    if (isSendingMessageError && !isAwaitingSystemResponse) {
      return (
        <RetrySendingMessageButton handleRetry={handleRetrySendingMessage} />
      );
    }

    return null;
  };

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollTop <= 0) {
        handleFetchOlderMessages();
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [handleFetchOlderMessages]);

  return (
    <>
      {isChatOpen && (
        <div
          className={cn(
            "fixed w-[100vw] h-[100vh] bg-black z-[4900] top-0 left-0 bottom-0 right-0 transition-opacity duration-500 ease-in-out pointer-events-none",
            {
              "opacity-70 pointer-events-auto": isExpanded,
              "opacity-0": !isExpanded,
            }
          )}
        ></div>
      )}
      <div className={rootClassName}>
        <div className="relative flex items-center justify-center pb-4">
          <button
            className="mr-auto"
            onClick={() => {
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? (
              <CollapseIcon />
            ) : (
              <div className="rotate-90 w-fit">
                <ExpandIcon />
              </div>
            )}
          </button>
          <p className="absolute left-1/2 transform -translate-x-1/2 max-w-[60%] truncate bg-gradient-to-r from-[#9A67E2] to-[#F89AEE] bg-clip-text text-transparent text-center">
            {capitalizeFirstLetterOfEachWord(documentTitleInView)}
          </p>

          <div className="ml-auto">
            <button
              onClick={() => {
                dispatch(setIsChatOpen(false));
              }}
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <div
          style={{ flex: 1 }}
          className="flex-1 flex-col overflow-y-auto py-8 space-y-2 no-scrollbar"
          ref={messagesContainerRef}
        >
          <HighlightableTextArea
            popoverItem={(HighlightedText, setPopoverState) => {
              return (
                <TextSelectionPopup
                  selectedText={HighlightedText}
                  clearSelection={() => {
                    setPopoverState(false);
                  }}
                  callBackOnAction={() => {
                    setTimeout(() => {
                      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                    }, 600);
                  }}
                />
              );
            }}
          >
            <div>
              {[...messages].map((message, idx) => {
                if (message.sender === "user") {
                  return <UserMessage message={message.message} key={idx} />;
                }
                return (
                  <SystemMessage
                    message={message.message}
                    key={idx}
                    scrollToBottom={() => {
                      messagesEndRef.current?.scrollIntoView({
                        behavior: "smooth",
                      });
                    }}
                  />
                );
              })}
              {getFooterElement()}
            </div>
          </HighlightableTextArea>
          <div ref={messagesEndRef} />
        </div>

        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            onInput={handleInput}
            className="w-full border resize-none rounded-xl outline-none px-4 py-3 mb-0.5  overflow-y-auto leading-tight text-sm no-scrollbar"
            style={{
              minHeight: "28px",
              maxHeight: "200px",
              flex: 1,
            }}
            value={message}
            onChange={(e) => {
              const value = e.target.value;
              setMessage(value);
            }}
            rows={1}
            placeholder="Ask anything ..."
          />
          <IconButton
            icon={<ArrowUpIcon />}
            disabled={message.trim().length === 0 || isAwaitingSystemResponse}
            onClick={() => {
              sendMessage(message);
              setMessage("");

              setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
              }, 650);
            }}
            className={
              false
                ? "!bg-gray-300 !border-gray-300 transition-all cursor-auto"
                : "transition-all"
            }
          />
        </div>
      </div>
    </>
  );
};

export default DocumentChatMessagesContainer;
