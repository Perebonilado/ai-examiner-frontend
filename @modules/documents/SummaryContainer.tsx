import React, { FC, useEffect, useState } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { useDispatch } from "react-redux";
import { useTextSelectionPopUp } from "@/hooks/useTextSelectionPopUp";
import TextSelectionPopup from "@/@shared/components/TextSelectionPopUp";
import { HighlightableTextArea } from "react-highlight-popover";

interface Props {
  summary: string;
}

const SummaryContainer: FC<Props> = ({ summary }) => {
  const [htmlSummary, setHtmlSummary] = useState("");

  useEffect(() => {
    if (summary) {
      generateHtmlSummary();
    }
  }, [summary]);

  const generateHtmlSummary = async () => {
    // Sanitize first, then parse Markdown
    const sanitized = DOMPurify.sanitize(summary);
    const parsed = await marked(sanitized);
    setHtmlSummary(parsed);
  };

  // const { popupPosition, selectedText, clearSelection } =
  //   useTextSelectionPopUp();
  const dispatch = useDispatch();

  return (
    <>
      <div className="w-full h-full flex flex-col">
        {htmlSummary ? (
          <HighlightableTextArea
            popoverItem={(HighlightedText, setPopoverState) => {
              return (
                <TextSelectionPopup
                  selectedText={HighlightedText}
                  clearSelection={() => {
                    setPopoverState(false);
                    console.log('set to false')
                  }}
                />
              );
            }}
          >
            <div className="flex-1 w-full h-full overflow-auto">
              <div
                className="prose prose-sm max-w-none break-words px-4 py-2"
                dangerouslySetInnerHTML={{ __html: htmlSummary }}
              />
            </div>
          </HighlightableTextArea>
        ) : (
          <div className="flex-1 w-full h-full flex items-center justify-center text-gray-500">
            Summary Unavailable
          </div>
        )}
      </div>
      {/* <TextSelectionPopup
        visible={!!popupPosition}
        top={popupPosition?.top || 0}
        left={popupPosition?.left || 0}
        selectedText={selectedText}
        clearSelection={clearSelection}
      /> */}
    </>
  );
};

export default SummaryContainer;
