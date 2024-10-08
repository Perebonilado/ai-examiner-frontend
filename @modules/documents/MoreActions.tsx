import ConfirmationDialog from "@/@shared/components/ConfirmationDialog";
import React, { FC, useState } from "react";
import MoreActionsDefaultView from "./MoreActionsDefaultView";
import EditDocumentForm from "./EditDocumentForm";

export type ViewState = "default" | "edit" | "delete";

interface Props {
  deleteDocument: () => void;
  editTitle: (newTitle: string) => void;
  documentTitle: string;
}

const MoreActions: FC<Props> = ({
  deleteDocument,
  documentTitle,
  editTitle,
}) => {
  const [view, setView] = useState<ViewState>("default");

  const viewMap: Record<ViewState, React.ReactNode> = {
    default: (
      <MoreActionsDefaultView
        handleView={(view) => {
          setView(view);
        }}
      />
    ),
    delete: (
      <ConfirmationDialog
        title="Delete Document ?"
        message="This can't be undone"
        confirmationText="Delete"
        onConfirm={() => {
          deleteDocument();
        }}
        onCancel={() => {
          setView("default");
        }}
      />
    ),
    edit: (
      <EditDocumentForm
        documentTitle={documentTitle}
        handleSubmit={(title) => {
          editTitle(title);
        }}
        handleView={(view) => {
          setView(view);
        }}
      />
    ),
  };

  return viewMap[view];
};

export default MoreActions;
