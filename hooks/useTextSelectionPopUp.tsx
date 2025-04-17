import { useEffect, useState } from "react";

interface PopupPosition {
  top: number;
  left: number;
}

interface UseTextSelectionPopupReturn {
  popupPosition: PopupPosition | null;
  selectedText: string;
  clearSelection: () => void;
}

const clamp = (val: number, min: number, max: number): number =>
  Math.min(Math.max(val, min), max);

// Utility to detect mobile devices
const isMobileDevice = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  return /Mobi|Android/i.test(navigator.userAgent) || navigator.maxTouchPoints > 0;
};

export const useTextSelectionPopUp = (): UseTextSelectionPopupReturn => {
  const [selectedText, setSelectedText] = useState<string>("");
  const [popupPosition, setPopupPosition] = useState<PopupPosition | null>(
    null
  );

  const clearSelection = (): void => {
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
    }
    setSelectedText("");
    setPopupPosition(null);
  };

  const handleSelection = () => {
    const selection: Selection | null = window.getSelection();
    const text: string = selection?.toString().trim() ?? "";

    if (text.length > 0 && selection?.rangeCount) {
      const range: Range = selection.getRangeAt(0);
      const rects = Array.from(range.getClientRects());

      if (rects.length === 0) return;

      // Choose the top-most rect
      const rect = rects.reduce((prev, curr) =>
        curr.top < prev.top ? curr : prev
      );

      // Dimensions and spacing
      const popupWidth = 150;
      const popupHeight = 40;
      const viewportMargin = 10;
      const extraSpacing = 12; // additional space between text and popup
      const scrollY = window.scrollY || window.pageYOffset;

      let top: number;
      // On mobile, position below selection plus extra spacing
      if (isMobileDevice()) {
        top = rect.bottom + scrollY + extraSpacing;
      } else {
        // On desktop, position above the selection minus extra spacing
        top = rect.top + scrollY - popupHeight - extraSpacing;
      }

      // Calculate horizontal center of selection
      let left = rect.left + (window.scrollX || window.pageXOffset) + rect.width / 2;

      // Clamp horizontal within viewport
      left = clamp(
        left,
        popupWidth / 2 + viewportMargin,
        window.innerWidth - popupWidth / 2 - viewportMargin
      );

      // Clamp vertical within viewport bounds
      top = clamp(
        top,
        viewportMargin,
        window.innerHeight - popupHeight - viewportMargin
      );

      setSelectedText(text);
      setPopupPosition({ top, left });
    } else {
      setPopupPosition(null);
    }
  };

  useEffect(() => {
    const handleEnd = (event: Event) => {
      const target = event.target as HTMLElement;
      const isInputOrTextarea =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (isInputOrTextarea) return;

      setTimeout(handleSelection, 0);
    };

    const handleClickOutside = () => {
      const selection = window.getSelection();
      if (selection?.toString().trim() === "") {
        setPopupPosition(null);
      }
    };

    document.addEventListener("mouseup", handleEnd);
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchend", handleEnd);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchend", handleEnd);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  return { popupPosition, selectedText, clearSelection };
};
