import React, { forwardRef } from "react";
import { createPortal } from "react-dom";
import { useDispatch } from "react-redux";
import {
  setHighlightToPrompt,
  setIsChatOpen,
  setNotSureMessage,
} from "@/features/documentChatSlice";
import useClickOutside from "@/hooks/useClickOutside";
import {
  HighlightToPrompt,
  HighlightToPromptType,
} from "@/models/document-message.model";
import {
  setImageSearchOpen,
  setImageSearchQuery,
} from "@/features/imageSearchSlice";

export interface TextSelectionPopupProps {
  selectedText: string;
  clearSelection: () => void;
  callBackOnAction?: () => void;
}

const TextSelectionPopup = forwardRef<HTMLDivElement, TextSelectionPopupProps>(
  ({ selectedText, clearSelection, callBackOnAction }) => {
    const dispatch = useDispatch();

    const handleAction = (action: HighlightToPrompt) => {
      if (action.highlight === "visualize") {
        dispatch(setImageSearchQuery(action.question));
        setTimeout(() => {
          dispatch(setImageSearchOpen(true));
        }, 300);
        if (callBackOnAction) callBackOnAction();
        return;
      }

      dispatch(
        setHighlightToPrompt({
          question: action.question,
          highlight: action.highlight,
        })
      );
      setTimeout(() => dispatch(setIsChatOpen(true)), 300);
      if (callBackOnAction) callBackOnAction();
    };

    const ref = useClickOutside<HTMLDivElement>(() => {
      clearSelection();
    });

    return (
      <div className="select-none" ref={ref}>
        <div className="flex flex-col items-center">
          <div
            className={`bg-purple-500 text-white shadow-md border border-gray-200 rounded-lg px-4 py-3 flex gap-3`}
          >
            {["Explain", "Simplify", "Define", "Visualize"].map((action) => (
              <button
                key={action}
                onClick={(e) => {
                  handleAction({
                    highlight: action.toLowerCase() as HighlightToPromptType,
                    question: selectedText,
                  });
                  clearSelection();
                }}
                className="text-sm hover:underline focus:outline-none text-white font-semibold"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }
);

TextSelectionPopup.displayName = "TextSelectionPopup";

export default TextSelectionPopup;
