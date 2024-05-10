import React, { FC, ReactNode } from "react";
import ErrorMessage from "../ErrorMessage/ErrorMessage";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  isRequired?: boolean;
  label?: string;
  error?: string;
  starticon?: ReactNode;
  endicon?: ReactNode;
}

const TextField: FC<Props> = ({
  isRequired,
  label,
  error,
  starticon,
  endicon,
  ...props
}) => {
  return (
    <div className="flex flex-col w-full">
      {label && (
        <label className={`text-base font-semibold mb-2`}>
          {label} {isRequired && <span className="text-rose-600">*</span>}
        </label>
      )}
      <div className="w-full relative">
        <input
          className={
            "min-h-[20px] w-full text-black flex m-0 placeholder:text-gray-400 placeholder:text-sm px-4 py-1  rounded-md outline-none bg-white border border-gray-300 focus:border-blue-300 transition-all"
          }
          {...props}
        />
        {starticon && !endicon && (
          <span className="absolute top-2/4 -translate-y-1/2 left-2 cursor-pointer">
            {starticon}
          </span>
        )}
        {endicon && !starticon && (
          <span className="absolute top-2/4 -translate-y-1/2 right-2 cursor-pointer">
            {endicon}
          </span>
        )}
      </div>
     
      {Boolean(error?.trim()) && (
        <ErrorMessage className="mt-[4px] p-0" message={error as string} />
      )}
    </div>
  );
};

export default TextField;
