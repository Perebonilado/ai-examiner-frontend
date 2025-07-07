import {
  FC,
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import TextSelectionPopupV2 from "./TextSelectionPopupV2";

interface TooltipState {
  isVisible: boolean;
  text: string;
  position: { x: number; y: number };
}

export const HighlightableText: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [tooltip, setTooltip] = useState<TooltipState>({
    isVisible: false,
    text: "",
    position: { x: 0, y: 0 },
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const getSelectionCoords = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      return null;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect(); // Bounding rect of the selection in viewport coordinates
    const containerRect = containerRef.current?.getBoundingClientRect(); // Bounding rect of the container in viewport coordinates

    if (!containerRect) {
      return null;
    }

    // Initial desired position of the tooltip in viewport coordinates
    // The 'left' CSS property of the tooltip will be its center due to 'transform -translate-x-1/2'
    let xViewport = rect.left + rect.width / 2; // Horizontal center of the selected text in viewport
    let yViewport = rect.top - 40; // 40px above the top of the selected text in viewport

    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Approximate tooltip dimensions. For more precise positioning,
    // consider measuring the actual rendered tooltip (e.g., by rendering it
    // off-screen and measuring, or using a ResizeObserver on the Tooltip component).
    const tooltipApproxWidth = 120; // Estimated width based on 'px-3 py-1' and typical text
    const tooltipApproxHeight = 30; // Estimated height based on 'py-1' and font size

    const tooltipHalfWidth = tooltipApproxWidth / 2;

    // Adjust x position to keep tooltip within horizontal bounds of the viewport
    if ((xViewport - tooltipHalfWidth) < 0) {
      // If tooltip's left edge goes off screen left
      xViewport = tooltipHalfWidth; // Align tooltip's center so its left edge is at 0
    } else if ((xViewport + tooltipHalfWidth) > viewportWidth) {
      // If tooltip's right edge goes off screen right
      xViewport = viewportWidth - tooltipHalfWidth; // Align tooltip's center so its right edge is at viewportWidth
    }

    // Adjust y position to keep tooltip within vertical bounds of the viewport
    if (yViewport < 0) {
      // If the tooltip goes above the top edge of the screen
      // Position it below the selection instead, with some padding
      yViewport = rect.bottom + 10; // 10px below the selection
    }
    // No explicit check for the bottom boundary is needed here, as the tooltip is
    // either above or just below the selection, which should generally be within view.

    // Convert the final viewport coordinates back to coordinates relative to the containerRef
    const xRelative = xViewport - containerRect.left;
    const yRelative = yViewport - containerRect.top;

    return { x: xRelative, y: yRelative };
  }, []);

  // Handle mouse up event to detect text selection
  const handleMouseUp = useCallback(() => {
    const coords = getSelectionCoords();
    if (coords) {
      setTooltip({
        isVisible: true,
        text: "Click me!", // Or dynamically set based on selection
        position: coords,
      });
    } else {
      // If no selection or selection is collapsed, hide the tooltip
      setTooltip((prev) => ({ ...prev, isVisible: false }));
    }
  }, [getSelectionCoords]);

  // Handle mouse down event to immediately hide tooltip if clicking outside selection
  const handleMouseDown = useCallback((event: MouseEvent) => {
    // Check if the click is outside the container or the tooltip itself
    if (
      containerRef.current &&
      !containerRef.current.contains(event.target as Node)
    ) {
      setTooltip((prev) => ({ ...prev, isVisible: false }));
    }
  }, []);

  // Effect to add and clean up event listeners
  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [handleMouseUp, handleMouseDown]);

  return (
    <div ref={containerRef} className="relative">
      {children}
      <TextSelectionPopupV2
        position={tooltip.position}
        isVisible={tooltip.isVisible}
        hidePopUp={() => {
          setTooltip((prev) => ({ ...prev, isVisible: false }));
        }}
      />
    </div>
  );
};
