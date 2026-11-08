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
    `cursor-pointer h-11 text-sm w-full text-ink flex m-0 placeholder:text-faint placeholder:text-sm pl-3.5 pr-10 rounded-[10px] outline-none bg-surface border border-control shadow-xs hover:border-[#c9c8d0] focus:border-accent-bright focus:ring-4 focus:ring-[rgba(124,58,237,0.14)] transition-[border-color,box-shadow]`
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
    `w-full !text-sm absolute left-0 p-1.5 bg-surface rounded-xl border border-edge cursor-pointer shadow-pop z-[300] max-h-[240px] overflow-y-auto`,
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
        <label className="text-[13px] font-semibold text-ink">
          {label} {isRequired && <span className="text-rose-600">*</span>}
        </label>
      )}
      <div
        className={`w-full relative mt-1.5`}
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

        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />

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
