import React, { FC } from "react";
import ErrorMessage from "../ErrorMessage/ErrorMessage";

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  isRequired?: boolean;
  label?: string;
  error?: string;
}

const TextArea: FC<Props> = ({ isRequired, label, error, ...props }) => {
  return (
    <div className="flex flex-col w-full">
      {label && (
        <label className="text-white text-sm mb-2">
          {label}{" "}
          {isRequired && <span className="text-rose-600">*</span>}
        </label>
      )}
      {
        <textarea
          className="flex m-0 text-black placeholder:text-gray-400 placeholder:text-sm px-4 py-3 resize-none  rounded-md outline-none bg-white border-none"
          {...props}
        ></textarea>
      }
      {Boolean(error?.trim()) && (
        <ErrorMessage className="mt-[4px] p-0" message={error as string} />
      )}
    </div>
  );
};

export default TextArea;
