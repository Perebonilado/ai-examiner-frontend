import React, { FC, useEffect, useRef, useState } from "react";
import { ArrowUp, Maximize2, Minimize2, X } from "lucide-react";
import UserMessage from "./UserMessage";
import SystemMessage from "./SystemMessage";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/config/redux-config";
import cn from "classnames";
import { setIsChatOpen } from "@/features/documentChatSlice";
import MessageLoader from "./MessageLoader";
import NoMessageInfo from "./NoMessageInfo";
import RetrySendingMessageButton from "./RetrySendingMessageButton";
import { capitalizeFirstLetterOfEachWord } from "@/utils";
import { HighlightableText } from "@/@shared/components/HighlightableText";

interface Props {
  handleFetchOlderMessages: () => void;
  sendMessage: (message: string) => void;
  isAwaitingSystemResponse: boolean;
  isSendingMessageError: boolean;
  handleRetrySendingMessage: () => void;
}

const headerButton =
  "grid place-items-center w-[34px] h-[34px] max-md:w-10 max-md:h-10 shrink-0 rounded-lg text-muted hover:bg-hover hover:text-ink transition-colors";

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
  const documentTitle = capitalizeFirstLetterOfEachWord(documentTitleInView);

  // One white surface. Docked bottom-right (a bottom sheet on phones); expanded, it widens
  // into a centred panel over a scrim.
  const rootClassName = cn(
    `fixed z-[5000] flex flex-col overflow-hidden bg-surface
      shadow-[0_30px_80px_-30px_rgba(15,10,40,0.5),0_0_0_1px_rgba(16,12,40,0.06)]
      transition-[transform,opacity,visibility] duration-300 ease-out-expo motion-reduce:transition-none`,
    {
      "translate-y-3 opacity-0 invisible pointer-events-none": !isChatOpen,
      "translate-y-0 opacity-100 visible": isChatOpen,
      [`bottom-6 right-6 w-[380px] h-[min(560px,calc(100vh-48px))] rounded-2xl
        max-md:inset-x-0 max-md:bottom-0 max-md:w-full max-md:h-[min(640px,85dvh)] max-md:rounded-b-none`]:
        !isExpanded,
      [`inset-x-0 mx-auto bottom-6 w-[min(900px,calc(100vw-48px))] h-[min(85vh,860px)] rounded-2xl
        max-md:bottom-0 max-md:w-full max-md:h-[92dvh] max-md:rounded-b-none`]:
        isExpanded,
    }
  );

  const dispatch = useDispatch();

  const [message, setMessage] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isChatOpen)
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [isChatOpen, JSON.stringify(messages)]);

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

  const handleSend = (text: string) => {
    sendMessage(text);
    setMessage("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 650);
  };

  const getFooterElement = () => {
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

  const canSend = message.trim().length > 0 && !isAwaitingSystemResponse;

  return (
    <>
      {isChatOpen && (
        <div
          aria-hidden
          className={cn(
            "fixed inset-0 z-[4900] bg-[rgba(15,12,24,0.42)] transition-opacity duration-300 ease-out pointer-events-none",
            {
              "opacity-100 pointer-events-auto": isExpanded,
              "opacity-0": !isExpanded,
            }
          )}
        ></div>
      )}
      <section
        className={rootClassName}
        role="dialog"
        aria-label={`Chat about ${documentTitle}`}
        aria-hidden={!isChatOpen}
        data-chat-panel
      >
        <header className="flex items-center gap-0.5 h-[52px] shrink-0 pl-[18px] pr-2 max-md:pl-4 max-md:gap-0">
          <p className="flex-1 min-w-0 mr-1.5 truncate text-sm font-semibold text-ink">
            {documentTitle}
          </p>
          <button
            className={headerButton}
            aria-label={isExpanded ? "Collapse chat" : "Expand chat"}
            title={isExpanded ? "Collapse" : "Expand"}
            onClick={() => {
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? (
              <Minimize2 size={16} strokeWidth={1.75} />
            ) : (
              <Maximize2 size={16} strokeWidth={1.75} />
            )}
          </button>
          <button
            className={headerButton}
            aria-label="Close chat"
            title="Close"
            onClick={() => {
              dispatch(setIsChatOpen(false));
            }}
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </header>

        <div
          className="flex-1 min-h-0 flex flex-col overflow-y-auto no-scrollbar"
          ref={messagesContainerRef}
        >
          {messages.length ? (
            <div
              className={cn("w-full px-[18px] pt-2 pb-4", {
                "max-w-[760px] mx-auto": isExpanded,
              })}
            >
              <HighlightableText>
                <div className="flex flex-col gap-5">
                  {[...messages].map((message, idx) => {
                    if (message.sender === "user") {
                      return (
                        <UserMessage
                          message={message.message}
                          image={message.image}
                          key={idx}
                        />
                      );
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
              </HighlightableText>
            </div>
          ) : (
            <NoMessageInfo
              documentTitle={documentTitle}
              handleSelectSuggestion={(suggestion) => handleSend(suggestion)}
            />
          )}
          <div ref={messagesEndRef} />
        </div>

        <div
          className={cn("shrink-0 px-3 pt-1 pb-3", {
            "w-full max-w-[784px] mx-auto": isExpanded,
          })}
        >
          <div className="flex items-end gap-2 p-1.5 pl-4 rounded-[24px] border border-control bg-surface shadow-[0_1px_2px_rgba(16,12,40,0.05),0_8px_20px_-10px_rgba(16,12,40,0.18)] focus-within:border-[#c4c3cb] transition-colors">
            <textarea
              ref={textareaRef}
              onInput={handleInput}
              aria-label="Message"
              className="flex-1 min-w-0 min-h-9 max-h-[200px] py-2 resize-none bg-transparent border-0 outline-none focus-visible:outline-none text-sm leading-[1.4] text-ink placeholder:text-faint overflow-y-auto no-scrollbar"
              value={message}
              onChange={(e) => {
                const value = e.target.value;
                setMessage(value);
              }}
              rows={1}
              placeholder="Ask anything ..."
            />
            <button
              aria-label="Send"
              disabled={!canSend}
              onClick={() => handleSend(message)}
              className={cn(
                "grid place-items-center w-9 h-9 shrink-0 rounded-full text-white transition-colors",
                {
                  "bg-brand hover:bg-brand-hover": canSend,
                  "bg-control cursor-not-allowed": !canSend,
                }
              )}
            >
              <ArrowUp size={18} strokeWidth={2.25} />
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default DocumentChatMessagesContainer;
