import React, { ElementRef, forwardRef, useState } from "react";
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
import ExplainIcon from "@/icons/ExplainIcon";
import SimplifyIcon from "@/icons/SimplifyIcon";
import DefineIcon from "@/icons/DefineIcon";
import VisualizeIcon from "@/icons/VisualizeIcon";

export interface TextSelectionPopupProps {
  position: { x: number; y: number };
  isVisible: boolean;
  hidePopUp: () => void;
  callBackOnAction?: () => void;
}

const TextSelectionPopupV2 = forwardRef<
  HTMLDivElement,
  TextSelectionPopupProps
>(({ callBackOnAction, isVisible, position, hidePopUp }) => {
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

  const ref = useClickOutside<ElementRef<"div">>(() => {
    hidePopUp();
  });

  const keyIcon: Record<
    HighlightToPromptType,
    (props: { fill?: string }) => JSX.Element
  > = {
    explain: (props) => <ExplainIcon {...props} />,
    simplify: (props) => <SimplifyIcon {...props} />,
    define: (props) => <DefineIcon {...props} />,
    visualize: (props) => <VisualizeIcon {...props} />,
  };

  return (
    <div
      className="absolute"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? "auto" : "none",
        zIndex: 3000,
      }}
      ref={ref}
    >
      <div className="flex flex-col items-center">
        <div
          className={`bg-white text-white shadow-md border border-gray-200 rounded-lg overflow-hidden flex flex-col min-w-[150px]`}
        >
          {["Explain", "Simplify", "Define", "Visualize"].map((action) => {
            const [isHovering, setIsHovering] = useState(false);
            return (
              <button
                key={action}
                onClick={(e) => {
                  const selection = window.getSelection();
                  const selectedText = selection ? selection.toString() : "";
                  handleAction({
                    highlight: action.toLowerCase() as HighlightToPromptType,
                    question: selectedText,
                  });
                  hidePopUp();
                  setTimeout(() => {
                    window.getSelection()?.removeAllRanges();
                  }, 500);
                }}
                onMouseOver={() => {
                  setIsHovering(true);
                }}
                onMouseOut={() => {
                  setIsHovering(false);
                }}
                className="text-sm hover:bg-[#9333EA] hover:text-white py-3 px-2 focus:outline-none text-black font-semibold text-left flex items-center gap-3"
              >
                {keyIcon[action.toLowerCase() as HighlightToPromptType]({
                  fill: isHovering ? "white" : undefined,
                })}{" "}
                {action}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});

TextSelectionPopupV2.displayName = "TextSelectionPopup";

export default TextSelectionPopupV2;
