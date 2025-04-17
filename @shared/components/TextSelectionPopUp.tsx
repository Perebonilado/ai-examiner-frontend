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

const isMobileDevice = (): boolean => {
  if (typeof navigator === "undefined") return false;
  return /Mobi|Android/i.test(navigator.userAgent) || navigator.maxTouchPoints > 0;
};

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

    const isMobile = isMobileDevice();

    const handleAction = (action: string) => {
      clearSelection();
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
          transform: isMobile ? "translate(-50%, 0%)" : "translate(-50%, -100%)",
        }}
      >
        <div className="relative flex flex-col items-center">
          <div
            className={`bg-purple-500 text-white shadow-md border border-gray-200 rounded-lg px-4 py-3 flex gap-3 ${
              isMobile ? "border-t-0" : "border-b-0"
            }`}
          >
            {["Explain", "Simplify", "Define"].map((action) => (
              <button
                key={action}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleAction(action);
                }}
                className="text-sm hover:underline focus:outline-none text-white font-semibold"
              >
                {action}
              </button>
            ))}
          </div>

          {/* Arrow */}
          <div
            className={`absolute ${
              isMobile ? "bottom-full" : "top-full"
            } left-1/2 transform -translate-x-1/2`}
          >
            <svg
              width="20"
              height="10"
              viewBox="0 0 20 10"
              fill="#a855f7"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMobile ? (
                <path d="M0 10 L10 0 L20 10 Z" /> // Arrow pointing up
              ) : (
                <path d="M0 0 L10 10 L20 0 Z" /> // Arrow pointing down
              )}
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
