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

      const rect = rects.reduce((prev, curr) =>
        curr.top < prev.top ? curr : prev
      );

      const popupWidth = 150;
      const popupHeight = 40;
      const margin = 10;

      let top = rect.top + window.scrollY - popupHeight - 8;
      let left = rect.left + window.scrollX + rect.width / 2;

      left = clamp(
        left,
        popupWidth / 2 + margin,
        window.innerWidth - popupWidth / 2 - margin
      );
      top = clamp(top, margin, window.innerHeight - popupHeight - margin);

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
