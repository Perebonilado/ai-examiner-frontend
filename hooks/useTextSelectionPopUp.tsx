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
    if (selection) {
      selection.removeAllRanges();
    }
    setSelectedText("");
    setPopupPosition(null);
  };

  useEffect(() => {
    const handleMouseUp = (): void => {
      setTimeout(() => {
        const selection: Selection | null = window.getSelection();
        const text: string = selection?.toString().trim() ?? "";

        if (text.length > 0 && selection?.rangeCount) {
          const range: Range = selection.getRangeAt(0);
          // Use getClientRects() to get all the rects of the selection
          const rects = Array.from(range.getClientRects());
          // Pick the rectangle with the smallest top value (top-most rectangle)
          const rect = rects.reduce((prev, curr) =>
            curr.top < prev.top ? curr : prev
          );

          // Assume some estimated dimensions for the popup.
          // Adjust these values based on your actual styling.
          const popupWidth = 150;  // Example width in pixels
          const popupHeight = 40;  // Example height in pixels
          const margin = 10;       // Margin from the viewport edge

          // Calculate initial positions based on the rect
          let top = rect.top + window.scrollY - 8; // 8px offset so it appears above
          let left = rect.left + window.scrollX + rect.width / 2;

          // Clamp the left position to ensure the popup remains within the horizontal viewport bounds
          left = clamp(
            left,
            popupWidth / 2 + margin,
            window.innerWidth - popupWidth / 2 - margin
          );

          // Clamp the top position if needed. The top is clamped so that the full height of the popup is visible.
          top = clamp(
            top,
            margin,
            window.innerHeight - popupHeight - margin
          );

          setSelectedText(text);
          setPopupPosition({ top, left });
        } else {
          clearSelection();
        }
      }, 0); // Delay to allow DOM selection to finalize
    };

    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return { popupPosition, selectedText, clearSelection };
};
