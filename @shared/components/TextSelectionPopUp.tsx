import { setIsChatOpen, setNotSureMessage } from "@/features/documentChatSlice";
import React from "react";
import { createPortal } from "react-dom";
import { useDispatch } from "react-redux";

interface PopupProps {
  top: number;
  left: number;
  visible: boolean;
  selectedText: string;
  clearSelection: () => void;
  callBackOnAction?: () => void;
}

const TextSelectionPopup: React.FC<PopupProps> = ({
  top,
  left,
  visible,
  selectedText,
  callBackOnAction,
  clearSelection,
}) => {
  if (!visible) return null;

  const dispatch = useDispatch();

  const onAction = (action: string) => {
    dispatch(setNotSureMessage(`${action} - ${selectedText}`));

    setTimeout(() => {
      dispatch(setIsChatOpen(true));
    }, 300);

    if (callBackOnAction) callBackOnAction();

    clearSelection();
  };

  // The popup container positions the bubble and arrow relative to the target point.
  const popup = (
    <div
      className="fixed z-[9999]"
      style={{
        top,
        left,
        transform: "translate(-50%, -100%)",
      }}
    >
      <div className="relative flex flex-col items-center">
        {/* Bubble with action buttons */}
        <div className="bg-white shadow-md border border-gray-200 border-b-0 rounded-lg px-4 py-3 flex gap-3">
          <button
            onClick={() => onAction("Explain")}
            className="text-sm hover:underline"
          >
            Explain
          </button>
          <button
            onClick={() => onAction("Simplify")}
            className="text-sm hover:underline"
          >
            Simplify
          </button>
          <button
            onClick={() => onAction("Define")}
            className="text-sm hover:underline"
          >
            Define
          </button>
        </div>
        {/* Seamless Arrow pointing down */}
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
};

export default TextSelectionPopup;
