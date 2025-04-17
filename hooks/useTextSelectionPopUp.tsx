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
    const handleMouseUp = (event: MouseEvent): void => {
      // Check if the clicked element is an input or textarea
      const target = event.target as HTMLElement;
      const isInputOrTextarea = target.tagName === "INPUT" || 
                               target.tagName === "TEXTAREA" || 
                               target.isContentEditable;
      
      if (isInputOrTextarea) {
        return; // Don't show the popup for input fields
      }

      setTimeout(() => {
        const selection: Selection | null = window.getSelection();
        const text: string = selection?.toString().trim() ?? "";

        if (text.length > 0 && selection?.rangeCount) {
          const range: Range = selection.getRangeAt(0);
          // Use getClientRects() to get all the rects of the selection
          const rects = Array.from(range.getClientRects());
          
          if (rects.length === 0) {
            return; // No valid rects found
          }
          
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
          let top = rect.top + window.scrollY - popupHeight - 8; // Position above selection
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
          // Only clear popup position, not the selection itself
          // This avoids interfering with input selection behavior
          setPopupPosition(null);
        }
      }, 0); // Delay to allow DOM selection to finalize
    };

    // Handle clicks outside the selection to clear the popup
    const handleClickOutside = (e: MouseEvent): void => {
      const selection = window.getSelection();
      if (selection?.toString().trim() === "") {
        setPopupPosition(null);
      }
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return { popupPosition, selectedText, clearSelection };
};