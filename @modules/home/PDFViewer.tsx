import Button from "@/@shared/ui/Button";
import DropDown from "@/@shared/ui/Input/DropDown";
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
import Checkbox from "@/@shared/ui/Input/Checkbox/Checkbox";

const options = {
  cMapUrl: "/cmaps/",
  standardFontDataUrl: "/standard_fonts/",
};

interface Props {
  fileUrl: string;
  handleUploadPDF: (
    pages: string,
    start: string,
    end: string,
    isHandWritten?: boolean,
    images?: string[]
  ) => void;
}

const resizeObserverOptions = {};

const maxWidth = 800;

const PDFViewer: FC<Props> = ({ fileUrl, handleUploadPDF }) => {
  const { setModalContent } = useModalContext();
  const [pages, setPages] = useState("all");
  const [startPage, setStartPage] = useState("");
  const [endPage, setEndPage] = useState("");

  const [startPageOptions, setStartPageOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [endPageOptions, setEndPageOptions] = useState<
    { label: string; value: string }[]
  >([]);

  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
  const [startPageError, setStartPageError] = useState("");
  const [endPageError, setEndPageError] = useState("");
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageInputVal, setPageInputVal] = useState(`1`);
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
      setPageInputVal(String(decrement));
    }
  };

  const handleNextPage = () => {
    if (pageNumber < totalPages) {
      const increment = pageNumber + 1;
      setPageNumber(() => increment);
      setPageInputVal(String(increment));
    }
  };

  function onDocumentLoadSuccess({
    numPages: nextNumPages,
  }: PDFDocumentProxy): void {
    setTotalPages(nextNumPages);
    const pagesOptions = generatePagesOptions(1, nextNumPages);
    setStartPageOptions(pagesOptions);
    setEndPageOptions(pagesOptions);
  }

  const extractImagesFromPdf = async (fileUrl: string): Promise<string[]> => {
    const loadingTask = pdfjs.getDocument(fileUrl);
    const pdf = await loadingTask.promise;

    const images: string[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);

      const viewport = page.getViewport({ scale: 2 }); // you can tweak the scale for higher resolution
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context!,
        viewport,
      };

      await page.render(renderContext).promise;

      const dataUrl = canvas.toDataURL("image/png"); // or 'image/jpeg'
      images.push(dataUrl);
    }

    return images; // ordered array of images
  };

  const zoomChangeValue = 0.2;

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

  const generatePagesOptions = (start = 1, end: number) => {
    const options = [];

    for (let i = start; i <= end; i++) {
      const option = { label: `${i}`, value: `${i}` };
      options.push(option);
    }

    return options;
  };

  const [isHandWritten, setIsHandWritten] = useState(false);

  return (
    <div className="w-[90vw] max-sm:w-[97vw] max-w-[550px] h-[97vh] max-sm:h-[97vh] bg-[#F1EDFD] rounded-xl p-4 pt-2 overflow-y-auto">
      <div className="flex justify-end pb-2">
        <button
          onClick={() => {
            setModalContent(null);
          }}
        >
          <CloseIcon fill="black" />
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
            <div className="w-[47px] text-sm font-bold p-1 h-[28px] bg-[#CECECE] flex items-center justify-center">
              <input
                onBlur={(e) => {
                  const value = e.target.value.trim();
                  if (Number(value) >= 1 && Number(value) <= totalPages) {
                    setPageNumber(Number(value));
                  } else {
                    setPageInputVal(String(pageNumber));
                  }
                }}
                className="w-[45px] bg-transparent text-center outline-none"
                value={pageInputVal}
                onChange={(e) => {
                  const value = e.target.value.trim();
                  if (/^\d+$/.test(value) || value === "") {
                    setPageInputVal(value);
                  }
                }}
                type="text"
              />
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
        className="w-full h-[50%] flex justify-center no-scrollbar overflow-y-auto bg-[#FAFAFA]"
        ref={setContainerRef}
      >
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess as any}
          options={options}
          onItemClick={(e) => {
            setPageNumber(e.pageNumber);
            setPageInputVal(String(e.pageNumber));
          }}
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
            <div style={{ flex: 1 }}>
              <DropDown
                options={startPageOptions}
                label="Start Page"
                value={startPage}
                handleSelect={({ value }) => {
                  setStartPage(value);

                  setEndPage("");

                  const newEndPageOptions = generatePagesOptions(
                    Number(value),
                    totalPages
                  );
                  setEndPageOptions(newEndPageOptions);
                }}
                openFromTop={true}
              />
            </div>

            <div style={{ flex: 1 }}>
              <DropDown
                options={endPageOptions}
                label="End Page"
                value={endPage}
                handleSelect={({ value }) => {
                  setEndPage(value);
                }}
                openFromTop={true}
              />
            </div>
          </div>
        )}

        <div
          className="flex items-center gap-2 mb-4 cursor-pointer"
          onClick={() => {
            setIsHandWritten(!isHandWritten);
          }}
        >
          <Checkbox checked={isHandWritten} />
          <p className="text-sm">
            Please <span className="font-bold">SELECT</span> if the file is hand
            written
          </p>
        </div>

        <Button
          disabled={
            isSubmitDisabled || Boolean(startPageError) || Boolean(endPageError)
          }
          title="Upload"
          size="large"
          className={`mx-auto ${
            isSubmitDisabled || Boolean(startPageError) || Boolean(endPageError)
              ? "bg-gray-300"
              : ""
          }`}
          onClick={async () => {
            if (isHandWritten) {
              let images = await extractImagesFromPdf(fileUrl);
              if (startPage.length && endPage.length) {
                images = images.slice(
                  Number(startPage) - 1,
                  Number(endPage) 
                );
              }

              handleUploadPDF(pages, startPage, endPage, isHandWritten, images);
            } else {
              handleUploadPDF(pages, startPage, endPage);
            }
          }}
        />
      </div>
    </div>
  );
};

export default PDFViewer;
