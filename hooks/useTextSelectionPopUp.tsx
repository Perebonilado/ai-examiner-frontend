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

const isMobileDevice = (): boolean => {
  if (typeof navigator === "undefined") return false;
  return /Mobi|Android/i.test(navigator.userAgent) || navigator.maxTouchPoints > 0;
};

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

    const isMobile = isMobileDevice();
    const popupWidth = 150;
    const popupHeight = 40;
    const spacing = isMobile ? 4 : 14; // Larger spacing for web
    const margin = 10;

    // Calculate horizontal position (same for both web/mobile)
    const centerX = rect.left + rect.width / 2;
    let viewportLeft = centerX - popupWidth / 2;
    viewportLeft = clamp(
      viewportLeft,
      margin,
      window.innerWidth - popupWidth - margin
    );
    const left = viewportLeft + window.scrollX;

    // Calculate vertical position (different logic for web/mobile)
    let viewportTop;
    const desiredTopBelow = rect.bottom + spacing;
    const desiredTopAbove = rect.top - popupHeight - spacing;

    if (!isMobile) {
      // On web: Always try to place above first (unless it doesn't fit)
      const canFitAbove = desiredTopAbove >= margin;
      viewportTop = canFitAbove ? desiredTopAbove : desiredTopBelow;
    } else {
      // On mobile: Try below first, then above if needed
      const canFitBelow = desiredTopBelow + popupHeight <= window.innerHeight - margin;
      const canFitAbove = desiredTopAbove >= margin;
      viewportTop = canFitBelow ? desiredTopBelow : canFitAbove ? desiredTopAbove : clamp(
        desiredTopBelow,
        margin,
        window.innerHeight - popupHeight - margin
      );
    }

    const top = viewportTop + window.scrollY;

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