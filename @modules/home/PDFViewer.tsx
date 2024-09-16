import Button from "@/@shared/ui/Button";
import DropDown from "@/@shared/ui/Input/DropDown";
import TextField from "@/@shared/ui/Input/TextField";
import { useModalContext } from "@/contexts/ModalContext";
import ChevronLeft from "@/icons/ChevronLeft";
import CloseIcon from "@/icons/CloseIcon";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { pdfjs, Document, Page } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { useResizeObserver } from "@wojtekmaj/react-hooks";
import ZoomOutIcon from "@/icons/ZoomOutIcon";
import ZoomInIcon from "@/icons/ZoomInIcon";

const options = {
  cMapUrl: "/cmaps/",
  standardFontDataUrl: "/standard_fonts/",
};

interface Props {
  fileUrl: string;
  handleUploadPDF: (pages: string, start: string, end: string) => void;
}

const resizeObserverOptions = {};

const maxWidth = 800;

const PDFViewer: FC<Props> = ({ fileUrl, handleUploadPDF }) => {
  const { setModalContent } = useModalContext();
  const [pages, setPages] = useState("all");
  const [startPage, setStartPage] = useState("");
  const [endPage, setEndPage] = useState("");
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
  const [startPageError, setStartPageError] = useState("");
  const [endPageError, setEndPageError] = useState("");
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [totalPages, setTotalPages] = useState(0);
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>();
  const [zoom, setZoom] = useState(1);

  const url = useMemo(() => {
    return { url: fileUrl };
  }, []);

  const onResize = useCallback<ResizeObserverCallback>((entries) => {
    const [entry] = entries;

    if (entry) {
      setContainerWidth(entry.contentRect.width);
    }
  }, []);

  useResizeObserver(containerRef, resizeObserverOptions, onResize);

  useEffect(() => {
    if (pages === "all") {
      setIsSubmitDisabled(false);
      setStartPage("");
      setEndPage("");
      setStartPageError("");
      setEndPageError("");
    } else {
      if (startPage && endPage) {
        setIsSubmitDisabled(false);
      } else {
        setIsSubmitDisabled(true);
      }
    }
  }, [pages, startPage, endPage]);

  const handlePreviousPage = () => {
    if (pageNumber > 1) {
      const decrement = pageNumber - 1;
      setPageNumber(() => decrement);
    }
  };

  const handleNextPage = () => {
    if (pageNumber < totalPages) {
      const increment = pageNumber + 1;
      setPageNumber(() => increment);
    }
  };

  function onDocumentLoadSuccess({
    numPages: nextNumPages,
  }: PDFDocumentProxy): void {
    setTotalPages(nextNumPages);
  }

  const zoomChangeValue = .2

  const zoomIn = () => {
    const newZoom = zoom + zoomChangeValue;
    setZoom(() => newZoom);
  };

  const zoomOut = () => {
    if (zoom > 1) {
      const newZoom = zoom - zoomChangeValue;
      setZoom(newZoom);
    }
  };

  return (
    <div className="w-[90vw] max-sm:w-[97vw] max-w-[700px] h-[90vh] max-sm:h-[97vh] bg-[#F1EDFD] rounded-xl p-4 overflow-y-auto">
      <div className="flex justify-end pb-3">
        <button
          onClick={() => {
            setModalContent(null);
          }}
        >
          <CloseIcon />
        </button>
      </div>
      <div className="h-[50px] flex gap-4 justify-between items-center px-4 bg-white border-b-[2px] border-b-gray-300">
        <div className="flex gap-4 items-center text-sm">
          <p>Page</p>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePreviousPage}
              className="w-[28px] h-[28px] bg-[#CECECE] flex items-center justify-center"
            >
              <ChevronLeft />
            </button>
            <div className="w-[28px] text-sm font-bold p-1 h-[28px] bg-[#CECECE] flex items-center justify-center">
              {pageNumber}
            </div>
            <button
              onClick={handleNextPage}
              className="w-[28px] h-[28px] rotate-180 bg-[#CECECE] flex items-center justify-center"
            >
              <ChevronLeft />
            </button>
          </div>
          <p className="text-[#939393]">of {totalPages}</p>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={zoomOut}>
            <ZoomOutIcon />
          </button>

          <button onClick={zoomIn}>
            <ZoomInIcon />
          </button>
        </div>
      </div>
      <div
        className="w-full h-[70%] flex justify-center no-scrollbar overflow-y-auto bg-[#FAFAFA]"
        ref={setContainerRef}
      >
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          options={options}
        >
          <Page
            pageNumber={pageNumber}
            width={
              containerWidth ? Math.min(containerWidth, maxWidth) : maxWidth
            }
            scale={zoom}
          />
        </Document>
      </div>

      <div className="mt-3 flex flex-col gap-4">
        <DropDown
          options={[
            { label: "All", value: "all", defaultSelected: true },
            { label: "Custom", value: "custom", defaultSelected: true },
          ]}
          label="Pages"
          value={pages}
          handleSelect={({ value }) => {
            setPages(value);
          }}
        />

        {pages === "custom" && (
          <div className="flex gap-3">
            <TextField
              label="Start Page"
              value={startPage}
              error={startPageError}
              onChange={(e) => {
                const value = e.target.value.trim();
                if (/^\d+$/.test(value) || value === "") {
                  setStartPage(value);

                  if (endPage && Number(value) > Number(endPage)) {
                    setStartPageError(
                      "Start page must be lesser than end page"
                    );
                  } else {
                    setStartPageError("");
                    setEndPageError("");
                  }
                }
              }}
              onBlur={(e) => {
                if (e.target.value.startsWith("0")) {
                  setStartPage("");
                }
              }}
            />
            <TextField
              label="End Page"
              value={endPage}
              error={endPageError}
              onChange={(e) => {
                const value = e.target.value.trim();
                if (/^\d+$/.test(value) || value === "") {
                  setEndPage(value);

                  if (startPage && Number(startPage) > Number(value)) {
                    setEndPageError("End page must be greater than start page");
                  } else {
                    setEndPageError("");
                    setStartPageError("");
                  }
                }
              }}
              onBlur={(e) => {
                if (e.target.value.startsWith("0")) {
                  setEndPage("");
                }
              }}
            />
          </div>
        )}

        <Button
          disabled={
            isSubmitDisabled || Boolean(startPageError) || Boolean(endPageError)
          }
          title="Upload"
          size="medium"
          className={`w-fit mx-auto ${
            isSubmitDisabled || Boolean(startPageError) || Boolean(endPageError)
              ? "bg-gray-300"
              : ""
          }`}
          onClick={() => {
            handleUploadPDF(pages, startPage, endPage);
          }}
        />
      </div>
    </div>
  );
};

export default PDFViewer;
