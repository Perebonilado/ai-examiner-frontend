import React, {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useDispatch } from "react-redux";
import cn from "classnames";
import { BookA, Image as ImageIcon, Lightbulb, LucideIcon, Sparkles } from "lucide-react";
import { setHighlightToPrompt, setIsChatOpen } from "@/features/documentChatSlice";
import {
  HighlightToPrompt,
  HighlightToPromptType,
} from "@/models/document-message.model";
import {
  setImageSearchOpen,
  setImageSearchQuery,
} from "@/features/imageSearchSlice";

export interface TextSelectionPopupProps {
  position: { x: number; y: number };
  isVisible: boolean;
  hidePopUp: () => void;
  callBackOnAction?: () => void;
}

const ACTIONS: { key: HighlightToPromptType; label: string; Icon: LucideIcon }[] = [
  { key: "explain", label: "Explain", Icon: Lightbulb },
  { key: "simplify", label: "Simplify", Icon: Sparkles },
  { key: "define", label: "Define", Icon: BookA },
  { key: "visualize", label: "Visualize", Icon: ImageIcon },
];

/** Pages that set this attribute on an ancestor (Easy Read) get the bar fixed above their phone bottom bar. */
const DOCK_ATTR = "data-selection-dock";
const PHONE_QUERY = "(max-width: 767px)";
const GAP = 10;
const EDGE = 8;
const ARROW_INSET = 28;

interface Placement {
  top: number;
  left: number;
  below: boolean;
  arrow: number;
}

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

/**
 * Dark selection bar: Explain / Simplify / Define / Visualize.
 * On desktop it sits just under the selection (above it when there is no room below), lined up
 * with the selection's left edge. On phones inside Easy Read it is fixed above the bottom bar.
 */
const TextSelectionPopupV2 = forwardRef<HTMLDivElement, TextSelectionPopupProps>(
  ({ callBackOnAction, isVisible, position, hidePopUp }, _ref) => {
    const dispatch = useDispatch();
    const ref = useRef<HTMLDivElement | null>(null);
    const lastTextRef = useRef("");
    const [placement, setPlacement] = useState<Placement | null>(null);
    const [docked, setDocked] = useState(false);
    const [inside, setInside] = useState(false);
    // Touch selections do not fire mouseup, so the docked bar also follows selectionchange.
    const [touchVisible, setTouchVisible] = useState(false);

    const selectionInside = useCallback(() => {
      const parent = ref.current?.offsetParent ?? ref.current?.parentElement;
      const selection = window.getSelection();
      if (!parent || !selection || selection.rangeCount === 0 || selection.isCollapsed) {
        return null;
      }
      const range = selection.getRangeAt(0);
      if (!parent.contains(range.commonAncestorContainer)) return null;
      return { parent: parent as HTMLElement, range, text: selection.toString() };
    }, []);

    const hide = useCallback(() => {
      setTouchVisible(false);
      hidePopUp();
    }, [hidePopUp]);

    // Phones in a docked reader: show while there is a selection in this container.
    useEffect(() => {
      const el = ref.current;
      if (!el) return;
      const media = window.matchMedia(PHONE_QUERY);
      const isDocked = () => media.matches && !!el.closest(`[${DOCK_ATTR}]`);
      setDocked(isDocked());

      let timer: ReturnType<typeof setTimeout> | undefined;
      const onSelectionChange = () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          if (!isDocked()) return;
          const found = selectionInside();
          if (found) lastTextRef.current = found.text;
          setTouchVisible(!!found && found.text.trim().length > 0);
        }, 150);
      };
      const onMedia = () => setDocked(isDocked());
      document.addEventListener("selectionchange", onSelectionChange);
      media.addEventListener("change", onMedia);
      return () => {
        clearTimeout(timer);
        document.removeEventListener("selectionchange", onSelectionChange);
        media.removeEventListener("change", onMedia);
      };
    }, [selectionInside]);

    // Close on a press outside the bar.
    useEffect(() => {
      const onDown = (e: MouseEvent) => {
        if (ref.current && !ref.current.contains(e.target as Node)) hidePopUp();
      };
      window.addEventListener("mousedown", onDown);
      return () => window.removeEventListener("mousedown", onDown);
    }, [hidePopUp]);

    // Place the bar next to the selection.
    useLayoutEffect(() => {
      const el = ref.current;
      if (!el || !isVisible) return;
      const found = selectionInside();
      setInside(!!found);
      if (!found) return;
      lastTextRef.current = found.text;
      if (docked) return;

      const sel = found.range.getBoundingClientRect();
      const parentRect = found.parent.getBoundingClientRect();
      const width = el.offsetWidth;
      const height = el.offsetHeight;
      const viewportW = window.innerWidth;
      const viewportH = window.innerHeight;

      let below = true;
      let top = sel.bottom + GAP;
      // Leave room for floating controls along the bottom (page pill, chat button).
      if (top + height > viewportH - 72 && sel.top - GAP - height > EDGE) {
        below = false;
        top = sel.top - GAP - height;
      }
      // Stay inside both the viewport and the text's container (chat and summary panels are narrow).
      const minLeft = Math.max(EDGE, parentRect.left);
      const maxLeft = Math.min(viewportW - EDGE, parentRect.right) - width;
      const left = clamp(sel.left, minLeft, Math.max(minLeft, maxLeft));
      const arrow = clamp(sel.left + ARROW_INSET - left, 14, Math.max(14, width - 24));

      setPlacement({
        top: top - parentRect.top,
        left: left - parentRect.left,
        below,
        arrow,
      });
    }, [isVisible, position.x, position.y, docked, selectionInside]);

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

    const shown = docked ? touchVisible || (isVisible && inside) : isVisible && inside && !!placement;

    return (
      <div
        ref={ref}
        role="toolbar"
        aria-label="Selected text"
        aria-hidden={!shown}
        className={cn(
          "z-[3000] flex rounded-xl bg-inverse shadow-[0_16px_40px_-14px_rgba(0,0,0,.5)] transition-opacity duration-150",
          docked
            ? "fixed inset-x-4 bottom-[calc(126px+env(safe-area-inset-bottom))] justify-between gap-0.5 p-1"
            : "absolute gap-0.5 p-1",
          shown ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        style={
          docked
            ? undefined
            : shown
            ? {
                top: `${placement?.top ?? position.y}px`,
                left: `${placement?.left ?? position.x}px`,
              }
            : // Hidden: park it in the corner. Left at a selection made elsewhere on the page,
              // it would stretch its scrolling pane sideways (and let that pane scroll off).
              { top: 0, left: 0, visibility: "hidden" }
        }
      >
        {ACTIONS.map(({ key, label, Icon }) => (
          <button
            key={key}
            type="button"
            tabIndex={shown ? 0 : -1}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              const selection = window.getSelection();
              const selectedText = (selection ? selection.toString() : "") || lastTextRef.current;
              handleAction({ highlight: key, question: selectedText });
              hide();
              setTimeout(() => {
                window.getSelection()?.removeAllRanges();
              }, 500);
            }}
            className={cn(
              "inline-flex items-center rounded-lg font-semibold text-on-inverse transition-colors hover:bg-white/[.12] focus-visible:bg-white/[.12] focus-visible:outline-none",
              docked
                ? "h-[52px] min-w-0 flex-1 flex-col justify-center gap-[3px] px-1 text-[11.5px]"
                : "h-[34px] gap-1.5 px-[11px] text-[13px]"
            )}
          >
            <Icon
              size={docked ? 18 : 15}
              strokeWidth={1.75}
              className="shrink-0 text-accent-300"
              aria-hidden="true"
            />
            {label}
          </button>
        ))}

        {!docked && placement && (
          <span
            aria-hidden="true"
            className={cn(
              "absolute h-2.5 w-2.5 rotate-45 rounded-[2px] bg-inverse",
              placement.below ? "-top-[5px]" : "-bottom-[5px]"
            )}
            style={{ left: placement.arrow }}
          />
        )}
      </div>
    );
  }
);

TextSelectionPopupV2.displayName = "TextSelectionPopup";

export default TextSelectionPopupV2;
