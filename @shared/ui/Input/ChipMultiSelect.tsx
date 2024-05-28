import React, { FC, useState, ElementRef, useEffect } from "react";
import ChipItem from "./ChipItem";
import cn from "classnames";
import useClickOutside from "@/hooks/useClickOutside";
import DropDownItem from "./DropDownItem";
import ChevronDown from "@/icons/ChevronDown";

interface Props {
  options: { label: string; value: string }[];
  getSelectedItems: (items: { label: string; value: string }[]) => void;
  label?: string;
  isRequired?: boolean;
}

const ChipMultiSelect: FC<Props> = ({
  getSelectedItems,
  options,
  label,
  isRequired,
}) => {
  const [isFocus, setIsFocus] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const sortItems = (items: { label: string; value: string }[]) => {
    const itemsToSort = [...items];
    itemsToSort.sort((a, b) => {
      const labelA = a.label.toLowerCase();
      const labelB = b.label.toLowerCase();

      if (labelA < labelB) {
        return -1;
      }
      if (labelA > labelB) {
        return 1;
      }
      return 0;
    });

    return itemsToSort;
  };
  const [optionsCopy, setOptionsCopy] = useState<
    { label: string; value: string }[]
  >(sortItems([...options]));
  const [optionsOpen, setOptionsOpen] = useState(false);

  useEffect(() => {
    if (options.length) {
      setOptionsCopy(sortItems(options));
    } else setOptionsCopy([]);
  }, [JSON.stringify(options)]);

  const chipContainerStyles = cn(
    `border border-gray-300 min-h-[45px] px-4 py-3 rounded-md transition-all flex items-center justify-between gap-1`,
    {
      ["!border-[#2F004F]"]: isFocus,
    }
  );

  const chipContainerRef = useClickOutside<ElementRef<"div">>(() => {
    setIsFocus(false);
  });

  const containerRef = useClickOutside<ElementRef<"div">>(() => {
    setOptionsOpen(false);
  });

  return (
    <div className="relative cursor-pointer" ref={containerRef}>
      {label && (
        <label className="text-base font-semibold block mb-2">
          {label} {isRequired && <span className="text-rose-600">*</span>}
        </label>
      )}
      <div
        onClick={(e) => {
          setIsFocus(true);
          if (e.target === e.currentTarget) setOptionsOpen(!optionsOpen);
        }}
        ref={chipContainerRef}
        className={chipContainerStyles}
      >
        <div className="flex gap-3 flex-wrap">
          {selectedOptions.map((item, idx) => {
            return (
              <ChipItem
                {...item}
                key={idx}
                handleRemove={(item) => {
                  setOptionsCopy(sortItems([...optionsCopy, item]));
                  const filteredSelectedOptions = selectedOptions.filter(
                    (opt) => opt.value !== item.value
                  );

                  setSelectedOptions(filteredSelectedOptions);

                  getSelectedItems(filteredSelectedOptions);
                }}
              />
            );
          })}
        </div>
        <div className="flex items-center justify-center">
          <ChevronDown />
        </div>
      </div>
      {optionsOpen && (
        <div className="w-full absolute left-0 top-[calc(100%+5px)] px-4 bg-white rounded-md cursor-pointer shadow-md z-[300] max-h-[200px] overflow-y-auto">
          {optionsCopy.length ? (
            optionsCopy.map((opt, idx) => (
              <DropDownItem
                {...opt}
                onSelect={(e) => {
                  setSelectedOptions([
                    ...selectedOptions,
                    { label: e.label, value: e.value },
                  ]);

                  const filteredOptions = optionsCopy.filter(
                    (it) => it.value !== e.value
                  );

                  setOptionsCopy(filteredOptions);

                  getSelectedItems([
                    ...selectedOptions,
                    { label: e.label, value: e.value },
                  ]);
                }}
                key={idx}
              />
            ))
          ) : (
            <p className="text-center py-5 text-sm text-gray-400">
              No items to select
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ChipMultiSelect;
