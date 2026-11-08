import React, { FC, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowUp, Maximize2, Minimize2, Square, X } from "lucide-react";
import UserMessage from "./UserMessage";
import SystemMessage from "./SystemMessage";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/config/redux-config";
import cn from "classnames";
import { setIsChatOpen } from "@/features/documentChatSlice";
import NoMessageInfo from "./NoMessageInfo";
import RetrySendingMessageButton from "./RetrySendingMessageButton";
import { capitalizeFirstLetterOfEachWord } from "@/utils";
import { HighlightableText } from "@/@shared/components/HighlightableText";

interface Props {
  handleFetchOlderMessages: () => void;
  sendMessage: (message: string) => void;
  /** A reply is being written (Send turns into Stop). */
  isReplying: boolean;
  onStop: () => void;
  onRetry: (replyId: string) => void;
  onPageClick: (page: number) => void;
}

/** Within this distance of the bottom, the list follows a reply as it's written. */
const STICK_DISTANCE = 80;

const headerButton =
  "grid place-items-center w-[34px] h-[34px] max-md:w-10 max-md:h-10 shrink-0 rounded-lg text-muted hover:bg-hover hover:text-ink transition-colors";

const DocumentChatMessagesContainer: FC<Props> = ({
  handleFetchOlderMessages,
  isReplying,
  onStop,
  onRetry,
  onPageClick,
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

  const { isChatOpen, messages, documentTitleInView, pageReaders } = useSelector(
    (state: RootState) => state.documentChatReducer
  );
  const canJumpToPage = pageReaders > 0;
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
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  /** Follow the newest message (off once the student scrolls up to read). */
  const stickRef = useRef(true);
  const previousRef = useRef({ firstId: "", lastId: "", count: 0, height: 0 });
  const contentRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    const el = messagesContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  };

  // Opening the chat shows the newest messages.
  useEffect(() => {
    if (!isChatOpen) return;
    stickRef.current = true;
    scrollToBottom();
  }, [isChatOpen]);

  useLayoutEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const previous = previousRef.current;
    const firstId = messages[0]?.id ?? "";
    const last = messages[messages.length - 1];
    // A new question (typed, highlighted or "Not sure?") brings the conversation back into view.
    // It arrives together with its reply, so look at everything added since last time.
    const seen = messages.findIndex((m) => m.id === previous.lastId);
    if (seen !== -1 && messages.slice(seen + 1).some((m) => m.sender === "user")) {
      stickRef.current = true;
    }
    const olderAdded =
      previous.count > 0 && firstId !== previous.firstId && messages.length > previous.count;
    if (olderAdded && !stickRef.current) {
      // Older messages came in above: keep the reader where they were.
      el.scrollTop += el.scrollHeight - previous.height;
    } else if (stickRef.current) {
      scrollToBottom();
    }
    previousRef.current = {
      firstId,
      lastId: last?.id ?? "",
      count: messages.length,
      height: el.scrollHeight,
    };
  }, [messages]);

  // Replies change height after they render (folding, a panel resize): stay at the bottom.
  const hasMessages = messages.length > 0;
  useEffect(() => {
    const el = contentRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      if (stickRef.current) scrollToBottom();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMessages]);

  const handleSend = (text: string) => {
    stickRef.current = true;
    sendMessage(text);
    setMessage("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      stickRef.current =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        STICK_DISTANCE;
      if (container.scrollTop <= 0) {
        handleFetchOlderMessages();
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [handleFetchOlderMessages]);

  const handlePageClick = (page: number) => {
    // The expanded panel covers the reader.
    setIsExpanded(false);
    onPageClick(page);
  };

  const canSend = message.trim().length > 0 && !isReplying;

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
              ref={contentRef}
              className={cn("w-full px-[18px] pt-2 pb-4", {
                "max-w-[760px] mx-auto": isExpanded,
              })}
            >
              <HighlightableText>
                <div className="flex flex-col gap-5">
                  {messages.map((message) => {
                    if (message.sender === "user") {
                      return (
                        <UserMessage
                          message={message.message}
                          image={message.image}
                          key={message.id}
                        />
                      );
                    }
                    // A reply that failed before writing anything: the error sits under the question.
                    if (message.status === "error" && !message.message.trim()) {
                      return (
                        <RetrySendingMessageButton
                          key={message.id}
                          handleRetry={() => onRetry(message.id)}
                        />
                      );
                    }
                    return (
                      <SystemMessage
                        key={message.id}
                        message={message.message}
                        status={message.status}
                        phase={message.phase}
                        pages={message.pages}
                        canJumpToPage={canJumpToPage}
                        onPageClick={handlePageClick}
                        onRetry={() => onRetry(message.id)}
                      />
                    );
                  })}
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
            {isReplying ? (
              <button
                type="button"
                aria-label="Stop the reply"
                title="Stop"
                onClick={onStop}
                className="grid place-items-center w-9 h-9 shrink-0 rounded-full bg-ink text-white hover:opacity-90 transition-opacity"
              >
                <Square size={12} strokeWidth={0} fill="currentColor" aria-hidden />
              </button>
            ) : (
              <button
                type="button"
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
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default DocumentChatMessagesContainer;
