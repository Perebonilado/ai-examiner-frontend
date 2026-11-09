import React, { FC, ReactNode, useId } from "react";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import cn from "classnames";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  isRequired?: boolean;
  label?: string;
  error?: string;
  starticon?: ReactNode;
  endicon?: ReactNode;
  handleClick?: () => void;
  cursorPointer?: boolean;
  readOnly?: boolean
}

const TextField: FC<Props> = ({
  isRequired,
  label,
  error,
  starticon,
  endicon,
  handleClick,
  readOnly= false,
  cursorPointer = false,
  ...props
}) => {
  const autoId = useId();
  const inputId = props.id ?? autoId;
  const inputStyle = cn(
    `h-11 max-md:!text-base !text-sm w-full text-ink flex m-0 placeholder:text-faint placeholder:text-sm px-3.5 rounded-[10px] outline-none bg-surface border border-control-strong shadow-xs hover:border-muted focus:border-accent-bright focus:ring-4 focus:ring-[rgba(124,58,237,0.14)] transition-[border-color,box-shadow] disabled:bg-well disabled:text-subtle disabled:cursor-not-allowed`,
    {
      "pl-10": starticon !== undefined,
      "pr-11": endicon !== undefined,
      "cursor-pointer": cursorPointer
    }
  );
  return (
    <div className="flex flex-col w-full !text-sm">
      {label && (
        <label htmlFor={inputId} className={`text-[13px] font-semibold text-ink mb-1.5`}>
          {label} {isRequired && <span className="text-danger">*</span>}
        </label>
      )}
      <div className="w-full relative" onClick={handleClick}>
        <input className={inputStyle} {...props} id={inputId} readOnly={readOnly}/>
        {starticon && !endicon && (
          <span className="absolute top-2/4 -translate-y-1/2 left-3 cursor-pointer text-faint [&_svg]:w-4 [&_svg]:h-4">
            {starticon}
          </span>
        )}
        {endicon && !starticon && (
          <span className="absolute top-2/4 -translate-y-1/2 right-3 cursor-pointer text-faint">
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
