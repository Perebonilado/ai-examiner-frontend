import React, { ElementRef, FC, useRef, useState, useEffect } from "react";
import DropDownItem from "./DropDownItem";
import useClickOutside from "@/hooks/useClickOutside";
import cn from "classnames";
import ChevronDown from "@/icons/ChevronDown";
import ErrorMessage from "../ErrorMessage/ErrorMessage";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  options: { label: string; value: string; defaultSelected?: boolean }[];
  handleSelect?: ({
    label,
    value,
  }: {
    label: string;
    value: string;
    defaultSelected?: boolean;
  }) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  isRequired?: boolean;
  variant?: "regular" | "alt";
  openFromTop?: boolean;
  disableOpen?: boolean;
  handleClick?: () => void;
}

const DropDown: FC<Props> = ({
  options,
  handleSelect,
  placeholder = "",
  label,
  error,
  isRequired,
  openFromTop = false,
  variant = "alt",
  disableOpen = false,
  handleClick,
  ...props
}) => {
  const [isOptionsOpen, setOptionsOpen] = useState(false);
  const dropDownRef = useClickOutside<ElementRef<"div">>(() => {
    setOptionsOpen(false);
  });
  const mirrorInputRef = useRef<ElementRef<"input">>(null);
  const mainInputRef = useRef<ElementRef<"input">>(null);

  const inputStyleBasedOnVariant = cn(
    `cursor-pointer text-sm w-full text-black flex m-0 placeholder:text-gray-400 placeholder:text-sm px-4 py-2  rounded-md outline-none bg-white border border-gray-300 focus:border-[#2F004F] transition-all`
  );

  const onSelect = (val: {
    label: string;
    value: string;
    defaultSelected?: boolean | undefined;
  }) => {
    handleSelect && handleSelect(val);
    setOptionsOpen(false);
    if (mirrorInputRef.current) {
      mirrorInputRef.current.value = val.label;
    }

    // this sets the value property and then we are able to properly dispatch the input event so this component
    // can be properly integrated with formik

    if (mainInputRef.current && window) {
      try {
        Object?.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value"
        )?.set?.call(mainInputRef.current, val.value);

        const event = new Event("input", { bubbles: true });
        mainInputRef.current.dispatchEvent(event);
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    const defaultOption = options.find((opt) => opt.defaultSelected);
    if (defaultOption) {
      onSelect(defaultOption);
    }
  }, [JSON.stringify(options)]);

  const dropDownStyles = cn(
    `w-full !text-sm absolute left-0 px-4 bg-white rounded-md cursor-pointer shadow-md z-[300] max-h-[200px] overflow-y-auto`,
    {
      ["bottom-[calc(100%+5px)]"]: openFromTop,
      ["top-[calc(100%+5px)]"]: !openFromTop,
    }
  );

  useEffect(() => {
    if (!props.value && !options.some((o) => o.defaultSelected)) {
      if (mirrorInputRef.current) {
        mirrorInputRef.current.value = "";
      }
    }
  }, [props.value]);

  return (
    <div>
      {label && (
        <label className="text-sm font-semibold">
          {label} {isRequired && <span className="text-rose-600">*</span>}
        </label>
      )}
      <div
        className={`w-full relative mt-2`}
        ref={dropDownRef}
        onClick={() => {
         handleClick && handleClick();
        }}
      >
        <input
          ref={mirrorInputRef}
          className={inputStyleBasedOnVariant}
          onClick={() => {
            if (!disableOpen) {
              setOptionsOpen(true);
            }
          }}
          placeholder={placeholder}
          readOnly
        />
        <input className="hidden" ref={mainInputRef} {...props} />

        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2" />

        {isOptionsOpen && (
          <div className={dropDownStyles}>
            {options.map((opt, idx) => (
              <DropDownItem {...opt} onSelect={(e) => onSelect(e)} key={idx} />
            ))}
          </div>
        )}

        {Boolean(error?.trim()) && (
          <ErrorMessage className="mt-[4px] p-0" message={error as string} />
        )}
      </div>
    </div>
  );
};

export default DropDown;
