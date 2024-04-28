import { TrashIcon } from "@/icons/TrashIcon";
import React, { FC } from "react";
import { FileUploader } from "react-drag-drop-files";
import { toast } from "react-toastify";
import s from './styles.module.css'

interface Props {
  file: File | null;
  handleChange: (file: File | null) => void;
  allowedTypes: string[];
  maxFileSizeMB?: number;
}

const FileUpload: FC<Props> = ({
  file,
  handleChange,
  allowedTypes,
  maxFileSizeMB = 10,
}) => {
  return (
    <div>
      {file && (
        <div className="flex items-center gap-3 justify-end">
          <p className="font-bold text-sm">{file.name}</p>

          <button
            className="border-none outline-none p-0 m-0"
            onClick={() => {
              handleChange(null);
            }}
          >
            <TrashIcon fill="red" />
          </button>
        </div>
      )}

      {!file && (
        <div className={s.fileUploadContainer}>
          <FileUploader
            handleChange={handleChange}
            name="file"
            types={allowedTypes}
            maxSize={maxFileSizeMB}
            label=" Upload"
            onSizeError={() => {
              toast.error("Maximum File size allowed is 10mb");
            }}
          />
        </div>
      )}
    </div>
  );
};

export default FileUpload;
