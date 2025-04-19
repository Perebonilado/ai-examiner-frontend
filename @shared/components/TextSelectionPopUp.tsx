import React, { forwardRef } from "react";
import { createPortal } from "react-dom";
import { useDispatch } from "react-redux";
import { setIsChatOpen, setNotSureMessage } from "@/features/documentChatSlice";
import useClickOutside from "@/hooks/useClickOutside";

export interface TextSelectionPopupProps {
  selectedText: string;
  clearSelection: () => void;
  callBackOnAction?: () => void;
}

const TextSelectionPopup = forwardRef<HTMLDivElement, TextSelectionPopupProps>(
  ({ selectedText, clearSelection, callBackOnAction }) => {
    const dispatch = useDispatch();

    const handleAction = (action: string) => {
      dispatch(setNotSureMessage(`${action} — ${selectedText}`));
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
            {["Explain", "Simplify", "Define"].map((action) => (
              <button
                key={action}
                onClick={(e) => {
                  // e.preventDefault();
                  handleAction(action);
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
