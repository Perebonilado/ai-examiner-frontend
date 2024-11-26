import EditIcon from "@/icons/EditIcon";
import { TrashIcon } from "@/icons/TrashIcon";
import React, { FC } from "react";

interface Props {
  handleView: (title: 'edit' | 'delete') => void;
}

const MoreActionsDefaultView: FC<Props> = ({ handleView }) => {

  return (
    <div className="absolute top-6 right-1 overflow-hidden w-[250px] rounded-xl shadow-lg flex flex-col justify-center bg-white">
      <div className="my-3">
        <button
          className="flex items-center gap-5 p-4 w-full"
          onClick={() => {
            handleView("edit");
          }}
        >
          <EditIcon width={18} height={18} fill="#939393"/>
          <p className="text-sm">Edit Title</p>
        </button>
        <button
          className="flex items-center gap-5 p-4 w-full"
          onClick={() => {
            handleView("delete");
          }}
        >
          <TrashIcon fill="#939393" width="18" height="18" />
          <p className="text-sm">Delete Document</p>
        </button>
      </div>
    </div>
  );
};

export default MoreActionsDefaultView;
