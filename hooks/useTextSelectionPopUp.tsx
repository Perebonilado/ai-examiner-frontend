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
  const [popupPosition, setPopupPosition] = useState<PopupPosition | null>(null);

  const clearSelection = (): void => {
    const selection = window.getSelection();
    if (selection) selection.removeAllRanges();
    setSelectedText("");
    setPopupPosition(null);
  };

  const handleSelection = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim() ?? "";
  
    if (!selection?.rangeCount || text.length === 0) {
      setPopupPosition(null);
      return;
    }
  
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    if (!rect) return;
  
    const popupWidth = 150;
    const popupHeight = 40;
    const margin = 10;
  
    // 👇 Smart vertical offset: 8px above the selection block
    const spacingAboveSelection = 8;
  
    const centerX = rect.left + rect.width / 2;
    const left = clamp(
      centerX - popupWidth / 2,
      margin,
      window.innerWidth - popupWidth - margin
    ) + window.scrollX;
  
    const top = clamp(
      rect.top - popupHeight - spacingAboveSelection,
      margin,
      window.innerHeight - popupHeight - margin
    ) + window.scrollY;
  
    setSelectedText(text);
    setPopupPosition({ top, left });
  };
  
  useEffect(() => {
    const handleEnd = (event: Event) => {
      const target = event.target as HTMLElement;
      const isTextInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (isTextInput) return;
      setTimeout(handleSelection, 0);
    };

    const handleClickOutside = () => {
      const selection = window.getSelection();
      if (selection?.toString().trim() === "") {
        setPopupPosition(null);
      }
    };

    // ✅ KEEP all mouse and touch listeners for cross-device support
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
