import React, { FC, forwardRef, PropsWithChildren, ReactNode } from "react";
import cn from "classnames";
import { ChevronLeft, X } from "lucide-react";
import TransitionUp from "@/transitions/TransitionUp";

/* Shared frame for the new-document / new-test dialogs: a centred card on desktop,
   a bottom sheet on phones. Flat surface, hairline ring, neutral shadow. */

interface FrameProps {
  /** Tailwind max-width for desktop, e.g. "max-w-[440px]" */
  widthClass?: string;
  className?: string;
  labelledBy?: string;
  describedBy?: string;
}

export const DialogFrame = forwardRef<
  HTMLDivElement,
  PropsWithChildren<FrameProps>
>(
  (
    { children, widthClass = "max-w-[440px]", className, labelledBy, describedBy },
    ref
  ) => {
    return (
      <TransitionUp
        className={cn(
          "w-full max-md:max-w-none max-md:fixed max-md:inset-x-0 max-md:bottom-0",
          widthClass
        )}
      >
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
          className={cn(
            "relative bg-surface rounded-2xl overflow-hidden shadow-[0_30px_80px_-30px_rgba(15,10,40,0.5),0_0_0_1px_rgba(16,12,40,0.06)]",
            "max-md:rounded-b-none max-md:rounded-t-[20px] max-md:max-h-[94vh] max-md:overflow-y-auto",
            className
          )}
        >
          <div className="md:hidden w-9 h-1 mx-auto mt-2 rounded-full bg-control" />
          {children}
        </div>
      </TransitionUp>
    );
  }
);
DialogFrame.displayName = "DialogFrame";

export const DialogIconButton: FC<{
  label: string;
  onClick: () => void;
  icon: "back" | "close";
  className?: string;
}> = ({ label, onClick, icon, className }) => (
  <button
    type="button"
    aria-label={label}
    onClick={onClick}
    className={cn(
      "w-9 h-9 max-md:w-10 max-md:h-10 flex-shrink-0 grid place-items-center rounded-lg text-subtle hover:bg-hover hover:text-ink transition-colors",
      className
    )}
  >
    {icon === "back" ? (
      <ChevronLeft size={18} strokeWidth={1.75} aria-hidden />
    ) : (
      <X size={18} strokeWidth={1.75} aria-hidden />
    )}
  </button>
);

interface HeaderProps {
  title: ReactNode;
  titleId?: string;
  description?: ReactNode;
  descriptionId?: string;
  onClose?: () => void;
  onBack?: () => void;
}

/** Title row: [back] Title / description ... [close] */
export const DialogHeader: FC<HeaderProps> = ({
  title,
  titleId,
  description,
  descriptionId,
  onClose,
  onBack,
}) => (
  <div className="flex items-start gap-2 px-5 pt-5">
    {onBack && (
      <DialogIconButton
        label="Back"
        icon="back"
        onClick={onBack}
        className="-ml-2.5 -mt-1.5"
      />
    )}
    <div className="flex-1 min-w-0">
      <h2
        id={titleId}
        className="text-lg leading-[1.3] font-bold tracking-[-0.015em] text-ink"
      >
        {title}
      </h2>
      {description && (
        <p id={descriptionId} className="mt-1 text-sm text-subtle">
          {description}
        </p>
      )}
    </div>
    {onClose && (
      <DialogIconButton
        label="Close"
        icon="close"
        onClick={onClose}
        className="-mr-2 -mt-1.5"
      />
    )}
  </div>
);

/** Footer bar with the primary action(s), right-aligned; full width on phones. */
export const DialogFooter: FC<PropsWithChildren<{ className?: string }>> = ({
  children,
  className,
}) => (
  <div
    className={cn(
      "flex justify-end gap-2.5 px-5 py-3.5 border-t border-line bg-canvas",
      "max-md:px-4 max-md:pt-3 max-md:pb-[calc(12px+env(safe-area-inset-bottom))] [&>button]:min-w-[140px] max-md:[&>button]:flex-1",
      className
    )}
  >
    {children}
  </div>
);
