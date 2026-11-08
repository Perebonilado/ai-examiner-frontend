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
        <label className="text-[13px] font-semibold text-ink mb-1.5">
          {label}{" "}
          {isRequired && <span className="text-rose-600">*</span>}
        </label>
      )}
      {
        <textarea
          className="resize-none flex m-0 w-full text-ink text-[15px] leading-relaxed placeholder:text-faint placeholder:text-sm px-3.5 py-3 rounded-[10px] outline-none bg-surface border border-control shadow-xs hover:border-[#c9c8d0] focus:border-accent-bright focus:ring-4 focus:ring-[rgba(124,58,237,0.14)] transition-[border-color,box-shadow]"
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
