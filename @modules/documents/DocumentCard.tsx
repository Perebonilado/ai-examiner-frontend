import FileIcon from "@/icons/FileIcon";
import { AllDocumentsModel } from "@/models/document.model";
import React, { FC, useEffect } from "react";
import * as moment from "moment";
import { useRouter } from "next/router";
import { TrashIcon } from "@/icons/TrashIcon";
import { useModalContext } from "@/contexts/ModalContext";
import ConfirmationDialog from "@/@shared/components/ConfirmationDialog";
import { useUpdateDocumentMutation } from "@/api-services/document.service";
import { toast } from "react-toastify";

interface Props extends AllDocumentsModel {}

const DocumentCard: FC<Props> = ({ createdAt, id, title }) => {
  const router = useRouter();
  const { setModalContent } = useModalContext();
  const [deleteDocument, { isSuccess: deleteDocumentSuccess }] =
    useUpdateDocumentMutation();

  useEffect(() => {
    if (deleteDocumentSuccess) {
      toast.success("Document Deleted Successfully");
    }
  }, [deleteDocumentSuccess]);

  return (
    <div
      onClick={() => {
        router.push(`/questions/view-questions/${id}`);
      }}
      className="w-full cursor-pointer p-4 py-5 max-w-[350px] h-[180px] rounded-xl bg-white drop-shadow-sm border border-gray-200"
    >
      <div className="h-[60%] flex gap-2">
        <FileIcon />
      </div>
      <div className="h-[40%] flex flex-col justify-end gap-1 overflow-hidden px-2">
        <p className="text-sm font-bold truncate">{title}</p>
        <div className="flex items-center gap-2 justify-between">
          <p className="text-xs text-gray-500">
            Created{" "}
            {moment.utc(createdAt).local().format("ddd, MMM D YYYY h:mma")}
          </p>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setModalContent(
                <ConfirmationDialog
                  title="Delete Document ?"
                  message="This can't be undone"
                  confirmationText="Delete"
                  onConfirm={() => {
                    deleteDocument({ id, isDeleted: true });
                  }}
                />
              );
            }}
          >
            <TrashIcon fill="grey" width="20" height="20"/>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;
