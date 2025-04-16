import React, { FC, useEffect, useState, useRef } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import cn from "classnames";
import { useTextSelectionPopUp } from "@/hooks/useTextSelectionPopUp";
import TextSelectionPopup from "@/@shared/components/TextSelectionPopUp";
import { useDispatch } from "react-redux";
import { setNotSureMessage } from "@/features/documentChatSlice";

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

  const { popupPosition, selectedText, clearSelection } =
    useTextSelectionPopUp();
  const dispatch = useDispatch();

  const handleAction = (action: string) => {
    dispatch(
      setNotSureMessage(`
      ${action}

      ${selectedText}
      `)
    );

    clearSelection();
    setTimeout(() => {
      if (scrollToBottom) scrollToBottom();
    }, 600);
  };

  return (
    <>
      <div className="relative w-full max-w-[600px] bg-white p-3 rounded-xl">
        <div
          className="transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden"
          style={{ maxHeight: contentHeight ?? 200 }}
        >
          <div
            ref={innerRef}
            className="prose prose-sm !text-wrap overflow-x-hidden"
            dangerouslySetInnerHTML={{ __html: htmlMessage }}
          />
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
      <TextSelectionPopup
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
      />
    </>
  );
};

export default SystemMessage;
