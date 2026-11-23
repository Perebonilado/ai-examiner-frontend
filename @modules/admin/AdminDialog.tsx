import React, { FC, PropsWithChildren, ReactNode, useEffect, useId, useRef } from "react";
import cn from "classnames";
import { X } from "lucide-react";
import { buttonClass } from "./ui";

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  /** Buttons along the bottom. Leave out for a dialog that only shows something. */
  actions?: ReactNode;
  wide?: boolean;
}

/**
 * A modal on the native <dialog>: focus stays inside, Escape closes, and focus returns to the
 * button that opened it.
 */
const AdminDialog: FC<PropsWithChildren<Props>> = ({ open, title, onClose, actions, wide = false, children }) => {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        // A click on the backdrop (the dialog element itself) closes it.
        if (e.target === ref.current) onClose();
      }}
      className={cn(
        "m-auto w-[calc(100%-32px)] rounded-2xl border border-edge bg-surface p-0 text-body shadow-pop backdrop:bg-[rgba(15,12,24,0.42)]",
        wide ? "max-w-[720px]" : "max-w-[440px]"
      )}
    >
      {open && (
        <div className="flex max-h-[85dvh] flex-col">
          <div className="flex items-start gap-3 px-5 pb-2 pt-5">
            <h2 id={titleId} className="mr-auto text-lg font-bold tracking-[-0.01em] text-ink">
              {title}
            </h2>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="-mr-1.5 -mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-lg text-subtle transition-colors hover:bg-hover hover:text-ink"
            >
              <X size={18} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </div>
          <div className="min-h-0 overflow-y-auto px-5 pb-5 text-sm leading-relaxed text-subtle">{children}</div>
          {actions && (
            <div className="flex flex-wrap justify-end gap-2.5 border-t border-line bg-canvas px-5 py-4">{actions}</div>
          )}
        </div>
      )}
    </dialog>
  );
};

export const ConfirmDialog: FC<{
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}> = ({ open, title, message, confirmLabel, danger = false, busy = false, onConfirm, onClose }) => (
  <AdminDialog
    open={open}
    title={title}
    onClose={onClose}
    actions={
      <>
        <button type="button" onClick={onClose} className={buttonClass.secondary}>
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className={danger ? buttonClass.danger : buttonClass.primary}
        >
          {confirmLabel}
        </button>
      </>
    }
  >
    {message}
  </AdminDialog>
);

export default AdminDialog;
