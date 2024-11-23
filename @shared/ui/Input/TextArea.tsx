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
        <label className="text-sm font-semibold mb-2">
          {label}{" "}
          {isRequired && <span className="text-rose-600">*</span>}
        </label>
      )}
      {
        <textarea
          className="resize-none flex m-0 w-full text-black  placeholder:text-gray-400 placeholder:text-sm px-4 py-1  rounded-md outline-none bg-white border border-gray-300 focus:border-[#2F004F] transition-all"
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
