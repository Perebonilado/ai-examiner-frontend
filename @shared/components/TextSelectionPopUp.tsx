// TextSelectionPopup.tsx
import React, { forwardRef } from "react";
import { createPortal } from "react-dom";
import { useDispatch } from "react-redux";
import {
  setIsChatOpen,
  setNotSureMessage,
} from "@/features/documentChatSlice";

export interface TextSelectionPopupProps {
  top: number;
  left: number;
  visible: boolean;
  selectedText: string;
  clearSelection: () => void;
  callBackOnAction?: () => void;
}

const TextSelectionPopup = forwardRef<HTMLDivElement, TextSelectionPopupProps>(
  (
    {
      top,
      left,
      visible,
      selectedText,
      clearSelection,
      callBackOnAction,
    },
    ref
  ) => {
    const dispatch = useDispatch();
    if (!visible) return null;

    const handleAction = (action: string) => {
      // unmount the popup immediately
      clearSelection();

      // dispatch using the remembered text
      dispatch(setNotSureMessage(`${action} — ${selectedText}`));
      setTimeout(() => dispatch(setIsChatOpen(true)), 300);

      if (callBackOnAction) callBackOnAction();
    };

    const popup = (
      <div
        ref={ref}
        className="fixed z-[9999] select-none"
        style={{
          top,
          left,
          transform: "translate(-50%, -100%)",
        }}
      >
        <div className="relative flex flex-col items-center">
          <div className="bg-white shadow-md border border-gray-200 border-b-0 rounded-lg px-4 py-3 flex gap-3">
            {["Explain", "Simplify", "Define"].map((action) => (
              <button
                key={action}
                onMouseDown={(e) => {
                  e.preventDefault(); // stop the button text from being selected
                  handleAction(action);
                }}
                className="text-sm hover:underline focus:outline-none"
              >
                {action}
              </button>
            ))}
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2">
            <svg
              width="20"
              height="10"
              viewBox="0 0 20 10"
              fill="white"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0 0 L10 10 L20 0 Z" />
            </svg>
          </div>
        </div>
      </div>
    );

    return createPortal(popup, document.body);
  }
);

TextSelectionPopup.displayName = "TextSelectionPopup";

export default TextSelectionPopup;
