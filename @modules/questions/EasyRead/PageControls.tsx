import React, { ElementRef, FC, useRef } from "react";

interface Props {
  pageInputVal: string;
  handlePageInputVal: (val: string) => void;
  goToPage: (val: number) => void;
  totalPages: number;
  pageNumber: number;
}

const PageControls: FC<Props> = ({
  goToPage,
  handlePageInputVal,
  pageInputVal,
  pageNumber,
  totalPages,
}) => {
  const handleScrollToPage = (page: number, cb?: () => void) => {
    if (page >= 1 && page <= totalPages) {
      goToPage(page);
    } else {
      handlePageInputVal(String(pageNumber));
    }

    if (cb) {
      cb();
    }
  };

  const inputRef = useRef<ElementRef<"input">>(null);

  return (
    <div className="flex items-center gap-1 text-sm h-fit min-w-fit  pr-2 bg-white">
      <div className="text-[#9C9C9C] mb-1">Page</div>
      <div className="flex items-center gap-1">
        <div className="w-[32px] h-6 border border-[#9333EA] rounded-md flex items-center justify-center shadow-sm">
          <input
            type="text"
            ref={inputRef}
            className="w-full text-center text-xs font-semibold bg-transparent outline-none rounded-md"
            value={pageInputVal}
            onChange={(e) => {
              const val = e.target.value.trim();
              if (/^\d*$/.test(val)) handlePageInputVal(val);
            }}
            onBlur={(e) => {
              const val = parseInt(e.target.value.trim(), 10);
              handleScrollToPage(val);
            }}
            onKeyUp={(e) => {
              if (e.code.toLowerCase() === "enter") {
                const page = parseInt(e.currentTarget.value);
                handleScrollToPage(page, () => {
                  if (inputRef.current) inputRef.current.blur();
                });
              }
            }}
          />
        </div>
      </div>

      <div className="text-black font-medium items-center">of {totalPages}</div>
    </div>
  );
};

export default PageControls;
