import React, { FC } from "react";
import ErrorMessage from "../ErrorMessage/ErrorMessage";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  isRequired?: boolean;
  label?: string;
  error?: string;
}

const TextField: FC<Props> = ({ isRequired, label, error, ...props }) => {
  return (
    <div className="flex flex-col w-full">
      {label && (
        <label className={`text-base font-semibold mb-2`}>
          {label} {isRequired && <span className="text-rose-600">*</span>}
        </label>
      )}
      {
        <input
          className={
            "min-h-[20px] text-black flex m-0 placeholder:text-gray-400 placeholder:text-sm px-4 py-1  rounded-md outline-none bg-white border border-gray-300 focus:border-blue-300 transition-all"
          }
          {...props}
        />
      }
      {Boolean(error?.trim()) && (
        <ErrorMessage className="mt-[4px] p-0" message={error as string} />
      )}
    </div>
  );
};

export default TextField;
