import React, { ReactNode, useEffect, useState } from "react";
import {
  FloatingFocusManager,
  FloatingOverlay,
  FloatingPortal,
  autoUpdate,
  flip,
  offset,
  shift,
  size,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
  Placement,
} from "@floating-ui/react";
import cn from "classnames";

/** True below `px` wide (phones): popovers open as a sheet from the bottom there. */
export const useNarrow = (px = 640) => {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${px - 1}px)`);
    const update = () => setNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [px]);
  return narrow;
};

export const panelClass =
  "rounded-[14px] border border-line bg-surface text-ink shadow-pop outline-none";

interface Props {
  /** Renders the button; spread `props` onto it and pass `ref`. */
  trigger: (args: {
    ref: (node: HTMLElement | null) => void;
    props: Record<string, unknown>;
    open: boolean;
  }) => ReactNode;
  children: (close: () => void) => ReactNode;
  placement?: Placement;
  role?: "dialog" | "listbox" | "menu";
  /** Names the panel for screen readers. */
  label: string;
  className?: string;
  /** Open as a bottom sheet on phones (the date picker); menus stay anchored. */
  sheetOnPhones?: boolean;
  /** Where focus goes when the panel opens (index into tabbable elements, or -1 for the panel). */
  initialFocus?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/** A button that opens a floating panel: closes on Escape, an outside click, or `close()`. */
export const Popover = ({
  trigger,
  children,
  placement = "bottom-start",
  role = "dialog",
  label,
  className,
  sheetOnPhones = false,
  initialFocus = 0,
  open: controlled,
  onOpenChange,
}: Props) => {
  const [own, setOwn] = useState(false);
  const open = controlled ?? own;
  const setOpen = (next: boolean) => {
    if (controlled === undefined) setOwn(next);
    onOpenChange?.(next);
  };
  const narrow = useNarrow();
  const sheet = sheetOnPhones && narrow;

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(6),
      flip({ padding: 12 }),
      shift({ padding: 12 }),
      size({
        padding: 12,
        apply({ availableHeight, availableWidth, elements }) {
          elements.floating.style.maxHeight = `${Math.max(220, availableHeight)}px`;
          elements.floating.style.maxWidth = `${availableWidth}px`;
        },
      }),
    ],
  });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context),
    useDismiss(context),
    useRole(context, { role }),
  ]);
  const close = () => setOpen(false);

  return (
    <>
      {trigger({ ref: refs.setReference, props: getReferenceProps(), open })}
      {open && (
        <FloatingPortal>
          {sheet ? (
            <FloatingOverlay lockScroll className="z-[60] bg-black/40">
              <FloatingFocusManager context={context} initialFocus={initialFocus}>
                <div
                  ref={refs.setFloating}
                  aria-label={label}
                  {...getFloatingProps()}
                  className={cn(
                    panelClass,
                    "fixed inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-b-none pb-[env(safe-area-inset-bottom)]",
                    className
                  )}
                >
                  {children(close)}
                </div>
              </FloatingFocusManager>
            </FloatingOverlay>
          ) : (
            <FloatingFocusManager context={context} initialFocus={initialFocus} modal={role === "dialog"}>
              <div
                ref={refs.setFloating}
                style={floatingStyles}
                aria-label={label}
                {...getFloatingProps()}
                className={cn(panelClass, "z-[60] overflow-y-auto", className)}
              >
                {children(close)}
              </div>
            </FloatingFocusManager>
          )}
        </FloatingPortal>
      )}
    </>
  );
};
