import React, { FC } from "react";
import { Pencil, Trash2 } from "lucide-react";
import cn from "classnames";

interface Props {
  handleView: (title: "edit" | "delete") => void;
  handleViewPerformanceReport: () => void;
  className?: string;
}

const itemClass =
  "flex items-center gap-2.5 w-full h-9 px-2.5 rounded-[7px] text-sm font-medium text-left transition-colors";

const MoreActionsDefaultView: FC<Props> = ({ handleView, className }) => {
  return (
    <div
      role="menu"
      className={cn(
        "min-w-[220px] p-1.5 rounded-xl bg-surface border border-edge shadow-pop",
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        role="menuitem"
        className={cn(
          itemClass,
          "group text-body hover:bg-hover hover:text-ink focus-visible:bg-hover"
        )}
        onClick={() => {
          handleView("edit");
        }}
      >
        <Pencil
          size={16}
          strokeWidth={1.75}
          className="text-muted group-hover:text-ink"
          aria-hidden
        />
        Edit title
      </button>
      <div className="h-px bg-line my-1.5 -mx-1.5" role="separator" />
      <button
        type="button"
        role="menuitem"
        className={cn(itemClass, "text-danger hover:bg-danger-bg focus-visible:bg-danger-bg")}
        onClick={() => {
          handleView("delete");
        }}
      >
        <Trash2 size={16} strokeWidth={1.75} aria-hidden />
        Delete document
      </button>
    </div>
  );
};

export default MoreActionsDefaultView;
