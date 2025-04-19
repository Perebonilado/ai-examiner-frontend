import React, { FC, useEffect, useState, useRef } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { useTextSelectionPopUp } from "@/hooks/useTextSelectionPopUp";
import TextSelectionPopup from "@/@shared/components/TextSelectionPopUp";
import { HighlightableTextArea } from "react-highlight-popover";

interface Props {
  message: string;
  scrollToBottom?: () => void;
}

const SystemMessage: FC<Props> = ({ message, scrollToBottom }) => {
  const [htmlMessage, setHtmlMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldShowToggle, setShouldShowToggle] = useState(false);
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (message) {
      handleHtmlMessage();
    }
  }, [message]);

  useEffect(() => {
    if (innerRef.current) {
      const height = innerRef.current.scrollHeight;
      setShouldShowToggle(height > 200);
      setContentHeight(isExpanded ? height : 400);
    }
  }, [htmlMessage, isExpanded]);

  const handleHtmlMessage = async () => {
    const formatted = message;
    const parsed = await marked(DOMPurify.sanitize(formatted), {});
    setHtmlMessage(parsed);
  };

  // const { popupPosition, selectedText, clearSelection,} =
  //   useTextSelectionPopUp();

  return (
    <>
      <div className="relative w-full max-w-[93%] bg-white p-3 rounded-xl">
        <div
          className="transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden"
          style={{ maxHeight: contentHeight ?? 200 }}
        >
          {/* <HighlightableTextArea
            zIndex={9999}
            yOffset={0}
            popoverItem={(HighlightedText, setPopoverState) => {
              return (
                <TextSelectionPopup
                  selectedText={HighlightedText}
                  clearSelection={() => {
                    setPopoverState(false);
                  }}
                  callBackOnAction={() => {
                    setTimeout(() => {
                      scrollToBottom && scrollToBottom();
                    }, 600);
                  }}
                />
              );
            }}
          > */}
            <div
              ref={innerRef}
              className="prose prose-sm max-w-none break-words overflow-x-hidden"
              dangerouslySetInnerHTML={{ __html: htmlMessage }}
            />
          {/* </HighlightableTextArea> */}
        </div>

        {!isExpanded && shouldShowToggle && (
          <div className="absolute bottom-8 left-0 w-full h-10 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        )}

        {shouldShowToggle && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-purple-600 mt-2 underline"
          >
            {isExpanded ? "Show less" : "Show more"}
          </button>
        )}
      </div>
      {/* <TextSelectionPopup
        visible={!!popupPosition}
        top={popupPosition?.top || 0}
        left={popupPosition?.left || 0}
        selectedText={selectedText}
        clearSelection={clearSelection}
        callBackOnAction={() => {
          setTimeout(() => {
            scrollToBottom && scrollToBottom();
          }, 600);
        }}
      /> */}
    </>
  );
};

export default SystemMessage;
