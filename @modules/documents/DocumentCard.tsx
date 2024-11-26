import FileIcon from "@/icons/FileIcon";
import { AllDocumentsModel } from "@/models/document.model";
import React, { ElementRef, FC, useEffect, useState } from "react";
import * as moment from "moment";
import { useRouter } from "next/router";
import { useModalContext } from "@/contexts/ModalContext";
import ConfirmationDialog from "@/@shared/components/ConfirmationDialog";
import { useUpdateDocumentMutation } from "@/api-services/document.service";
import DotsIcon from "@/icons/DotsIcon";
import { toast } from "react-toastify";
import { capitalizeFirstLetterOfEachWord } from "@/utils";
import MoreActionsDefaultView from "./MoreActionsDefaultView";
import EditDocumentForm from "./EditDocumentForm";
import useClickOutside from "@/hooks/useClickOutside";

interface Props extends AllDocumentsModel {}

const DocumentCard: FC<Props> = ({ createdAt, id, title }) => {
  const router = useRouter();
  const { setModalContent } = useModalContext();
  const [deleteDocument] = useUpdateDocumentMutation();
  const [editDocument, { isSuccess: editDocumentSuccess }] =
    useUpdateDocumentMutation();
  const [isMoreActions, setIsMoreActions] = useState(false);
  const ref = useClickOutside<ElementRef<"button">>(() => {
    setIsMoreActions(false)
  });

  useEffect(() => {
    if (editDocumentSuccess) {
      toast.success("Successful");
    }
  }, [editDocumentSuccess]);

  return (
    <div
      onClick={() => {
        router.push(`/questions/view-questions/${id}`);
      }}
      className="w-full cursor-pointer p-4 py-5 max-w-[350px] h-[180px] rounded-xl bg-white drop-shadow-sm border border-gray-200"
    >
      <div className="h-[60%] flex items-start justify-between gap-2">
        <FileIcon />

        <button
          ref={ref}
          className="w-[45px] h-[45px] relative flex items-center justify-center"
          onClick={(e) => {
            e.stopPropagation();
            setIsMoreActions(!isMoreActions);
          }}
        >
          {isMoreActions && (
            <MoreActionsDefaultView
              handleView={(viewTitle) => {
                if (viewTitle === "delete") {
                  setModalContent(
                    <ConfirmationDialog
                      title="Delete Document ?"
                      message="This can't be undone"
                      confirmationText="Delete"
                      onConfirm={() => {
                        deleteDocument({ id, isDeleted: true });
                      }}
                      onCancel={() => {
                        setModalContent(null);
                      }}
                    />
                  );
                } else {
                  setModalContent(
                    <EditDocumentForm
                      documentTitle={title}
                      handleSubmit={(title) => {
                        editDocument({ id, title, isDeleted: false });
                      }}
                      handleClose={() => {
                        setModalContent(null);
                      }}
                    />
                  );
                }
              }}
            />
          )}
          <DotsIcon fill="#939393" width={20} height={20} />
        </button>
      </div>
      <div className="h-[40%] flex flex-col justify-end gap-1 overflow-hidden px-2">
        <p className="text-sm truncate text-[#1E1E1E] font-semibold">
          {capitalizeFirstLetterOfEachWord(title)}
        </p>
        <div className="flex items-center gap-2 justify-between">
          <p className="text-xs text-[#8E8E8E]">
            Created{" "}
            {moment.utc(createdAt).local().format("ddd, MMM D YYYY h:mma")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;
