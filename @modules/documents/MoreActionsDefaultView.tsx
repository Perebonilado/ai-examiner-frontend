import CloseIcon from "@/icons/CloseIcon";
import EditIcon from "@/icons/EditIcon";
import { TrashIcon } from "@/icons/TrashIcon";
import React, { FC } from "react";
import { ViewState } from "./MoreActions";
import { useModalContext } from "@/contexts/ModalContext";

interface Props {
  handleView: (title: ViewState) => void;
}

const MoreActionsDefaultView: FC<Props> = ({ handleView }) => {
  const { setModalContent } = useModalContext();

  return (
    <div className="w-full relative overflow-hidden max-w-[400px] max-md:max-w-[350px] rounded-xl shadow-lg flex flex-col justify-center bg-white">
      <div className="flex items-center justify-between p-4 bg-gray-100">
        <p className="font-medium text-left">Actions</p>
        <button
          className="cursor-pointer"
          onClick={() => {
            setModalContent(null);
          }}
        >
          <CloseIcon />
        </button>
      </div>
      <div className="my-3">
        <button
          className="flex items-center gap-5 p-4 w-full"
          onClick={() => {
            handleView("edit");
          }}
        >
          <EditIcon />
          <p>Edit Title</p>
        </button>
        <button
          className="flex items-center gap-5 p-4 w-full"
          onClick={() => {
            handleView("delete");
          }}
        >
          <TrashIcon fill="#DC3545" width="23" height="23" />
          <p>Delete Document</p>
        </button>
      </div>
    </div>
  );
};

export default MoreActionsDefaultView;
