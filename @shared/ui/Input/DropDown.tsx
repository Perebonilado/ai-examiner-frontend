import React, { ElementRef, FC, useRef, useState, useEffect, useId } from "react";
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
  // Keyboard: the option highlighted while the list is open, and the one last chosen.
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const autoId = useId();
  const inputId = props.id ? `${props.id}-control` : `${autoId}-control`;
  const listId = `${autoId}-list`;
  const optionId = (i: number) => `${autoId}-opt-${i}`;
  const dropDownRef = useClickOutside<ElementRef<"div">>(() => {
    setOptionsOpen(false);
  });
  const mirrorInputRef = useRef<ElementRef<"input">>(null);
  const mainInputRef = useRef<ElementRef<"input">>(null);

  const inputStyleBasedOnVariant = cn(
    `cursor-pointer h-11 text-sm max-md:text-base w-full text-ink flex m-0 placeholder:text-faint placeholder:text-sm pl-3.5 pr-10 rounded-[10px] outline-none bg-surface border border-control-strong shadow-xs hover:border-muted focus:border-accent-bright focus:ring-4 focus:ring-[rgba(124,58,237,0.14)] transition-[border-color,box-shadow]`
  );

  const onSelect = (val: {
    label: string;
    value: string;
    defaultSelected?: boolean | undefined;
  }) => {
    handleSelect && handleSelect(val);
    setOptionsOpen(false);
    setSelectedIndex(options.findIndex((o) => o.value === val.value));
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

  const openList = () => {
    if (disableOpen || !options.length) return;
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setOptionsOpen(true);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const last = options.length - 1;
    if (!isOptionsOpen) {
      if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(event.key)) {
        event.preventDefault();
        openList();
      }
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(last, i + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(last);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (options[activeIndex]) onSelect(options[activeIndex]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOptionsOpen(false);
    } else if (event.key === "Tab") {
      setOptionsOpen(false);
    }
  };

  // Keep the highlighted option in view while arrowing through a long list.
  useEffect(() => {
    if (isOptionsOpen && activeIndex >= 0) {
      document.getElementById(`${autoId}-opt-${activeIndex}`)?.scrollIntoView({ block: "nearest" });
    }
  }, [isOptionsOpen, activeIndex, autoId]);

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
        <label htmlFor={inputId} className="text-[13px] font-semibold text-ink">
          {label} {isRequired && <span className="text-danger">*</span>}
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
          id={inputId}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={isOptionsOpen}
          aria-controls={listId}
          aria-activedescendant={
            isOptionsOpen && activeIndex >= 0 ? optionId(activeIndex) : undefined
          }
          aria-label={label ? undefined : props["aria-label"] || placeholder || undefined}
          className={inputStyleBasedOnVariant}
          onClick={() => {
            if (isOptionsOpen) setOptionsOpen(false);
            else openList();
          }}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          readOnly
        />
        <input className="hidden" ref={mainInputRef} {...props} aria-label={undefined} />

        <ChevronDown aria-hidden="true" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />

        {isOptionsOpen && (
          <div className={dropDownStyles} id={listId} role="listbox" aria-labelledby={label ? inputId : undefined}>
            {options.map((opt, idx) => (
              <DropDownItem
                {...opt}
                id={optionId(idx)}
                active={idx === activeIndex}
                selected={idx === selectedIndex}
                onSelect={(e) => onSelect(e)}
                key={idx}
              />
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
