import React, { FC, ReactNode } from "react";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import cn from "classnames";

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
  const inputStyle = cn(
    `min-h-[50px] w-full text-black flex m-0 placeholder:text-gray-400 placeholder:text-sm px-4 py-1  rounded-md outline-none bg-white border border-gray-300 focus:border-[#2F004F] transition-all`,
    {
      "pl-11": starticon !== undefined,
      "pr-14": endicon !== undefined,
    }
  );
  return (
    <div className="flex flex-col w-full">
      {label && (
        <label className={`text-base font-semibold mb-2`}>
          {label} {isRequired && <span className="text-rose-600">*</span>}
        </label>
      )}
      <div className="w-full relative">
        <input className={inputStyle} {...props} />
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
