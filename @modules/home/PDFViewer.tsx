import Button from "@/@shared/ui/Button";
import DropDown from "@/@shared/ui/Input/DropDown";
import { useModalContext } from "@/contexts/ModalContext";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import cn from "classnames";
import { pdfjs, Document, Page } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { useResizeObserver } from "@wojtekmaj/react-hooks";
import Checkbox from "@/@shared/ui/Input/Checkbox/Checkbox";
import Spinner from "@/@shared/components/Spinner";

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
    images?: string[],
  ) => void;
}

const resizeObserverOptions = {};

/* The preview fits each page's real shape: the dialog is wider for landscape documents (slides)
   and only as tall as the page needs, so there is no empty grey block under a short page. */
const HEADER_H = 56;
const PREVIEW_PAD = 16;
const DIALOG_MAX_W = { portrait: 560, landscape: 760 };
const ZOOM_STEP = 0.25;
const ZOOM_MAX = 3;

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
  const [dialogRef, setDialogRef] = useState<HTMLElement | null>(null);
  const [dialogWidth, setDialogWidth] = useState(0);
  const controlsRef = useRef<HTMLDivElement>(null);
  const [controlsHeight, setControlsHeight] = useState(180);
  const [viewportHeight, setViewportHeight] = useState(() =>
    typeof window === "undefined" ? 800 : window.innerHeight,
  );
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  // height / width of the page on show; the first page decides the dialog's orientation.
  const [aspect, setAspect] = useState(1.414);
  const [firstAspect, setFirstAspect] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);

  const url = useMemo(() => {
    return { url: fileUrl };
  }, []);

  const onResize = useCallback<ResizeObserverCallback>((entries) => {
    const [entry] = entries;
    if (entry) setDialogWidth(entry.contentRect.width);
  }, []);

  useResizeObserver(dialogRef, resizeObserverOptions, onResize);

  // The controls under the preview change height (custom page range): keep the page fitting.
  useEffect(() => {
    const el = controlsRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() =>
      setControlsHeight(el.offsetHeight),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onWindowResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener("resize", onWindowResize);
    return () => window.removeEventListener("resize", onWindowResize);
  }, []);

  // Each page's own shape (decks mix portrait and landscape pages).
  useEffect(() => {
    if (!pdf) return;
    let cancelled = false;
    pdf
      .getPage(pageNumber)
      .then((page) => {
        if (cancelled) return;
        const viewport = page.getViewport({ scale: 1 });
        if (viewport.width > 0) {
          const next = viewport.height / viewport.width;
          setAspect(next);
          if (pageNumber === 1) setFirstAspect((prev) => prev ?? next);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [pdf, pageNumber]);

  const isLandscape = (firstAspect ?? aspect) < 1;
  const dialogMaxHeight = Math.round(
    viewportHeight * (viewportHeight < 700 ? 0.96 : 0.94),
  );
  // Room for the page: the dialog's height cap minus its header and the controls below.
  const availHeight = Math.max(
    160,
    dialogMaxHeight - HEADER_H - controlsHeight - 2 * PREVIEW_PAD,
  );
  const availWidth = Math.max(
    160,
    (dialogWidth || DIALOG_MAX_W.portrait) - 2 * PREVIEW_PAD,
  );
  // Fit the whole page, then zoom on top of that.
  const fitWidth = Math.min(availWidth, availHeight / aspect);
  const pageWidth = Math.round(fitWidth * zoom);
  const pageHeight = Math.round(pageWidth * aspect);
  const previewHeight = Math.min(pageHeight, availHeight) + 2 * PREVIEW_PAD;
  const isZoomed = zoom > 1;

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

  function onDocumentLoadSuccess(doc: PDFDocumentProxy): void {
    const nextNumPages = doc.numPages;
    setPdf(doc);
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

  const zoomIn = () =>
    setZoom((z) => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)));
  const zoomOut = () =>
    setZoom((z) => Math.max(1, +(z - ZOOM_STEP).toFixed(2)));

  const generatePagesOptions = (start = 1, end: number) => {
    const options = [];

    for (let i = start; i <= end; i++) {
      const option = { label: `${i}`, value: `${i}` };
      options.push(option);
    }

    return options;
  };

  const [isHandWritten, setIsHandWritten] = useState(false);
  const [isExtractingImagesFromPDF, setIsExtractingImagesFromPDF] =
    useState(false);

  const toolButton =
    "w-8 h-8 grid place-items-center rounded-lg text-subtle hover:bg-hover hover:text-ink transition-colors disabled:pointer-events-none disabled:opacity-35";

  return (
    <div
      ref={setDialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-viewer-title"
      style={{
        maxWidth: isLandscape ? DIALOG_MAX_W.landscape : DIALOG_MAX_W.portrait,
        maxHeight: dialogMaxHeight,
      }}
      className="w-[92vw] max-sm:w-[96vw] flex flex-col rounded-2xl bg-surface overflow-hidden shadow-[0_30px_80px_-30px_rgba(15,10,40,0.5),0_0_0_1px_rgba(16,12,40,0.06)] transition-[max-width] duration-200"
    >
      <h2 id="pdf-viewer-title" className="sr-only">
        Choose pages to upload
      </h2>
      <div className="h-14 flex-shrink-0 flex gap-4 justify-between items-center pl-4 pr-3 border-b border-line bg-surface">
        <div className="flex gap-2 items-center text-[13px] text-subtle">
          <span>Page</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Previous page"
              onClick={handlePreviousPage}
              className={toolButton}
            >
              <ChevronLeft size={16} strokeWidth={1.75} />
            </button>
            <input
              aria-label="Page number"
              onBlur={(e) => {
                const value = e.target.value.trim();
                if (Number(value) >= 1 && Number(value) <= totalPages) {
                  setPageNumber(Number(value));
                } else {
                  setPageInputVal(String(pageNumber));
                }
              }}
              className="w-11 h-8 rounded-lg border border-control-strong bg-surface text-center text-[13px] font-semibold text-ink tabular-nums outline-none focus:border-accent-bright"
              value={pageInputVal}
              onChange={(e) => {
                const value = e.target.value.trim();
                if (/^\d+$/.test(value) || value === "") {
                  setPageInputVal(value);
                }
              }}
              type="text"
            />
            <button
              type="button"
              aria-label="Next page"
              onClick={handleNextPage}
              className={toolButton}
            >
              <ChevronRight size={16} strokeWidth={1.75} />
            </button>
          </div>
          <span className="text-muted tabular-nums">of {totalPages}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Zoom out"
            className={toolButton}
            onClick={zoomOut}
            disabled={!isZoomed}
          >
            <ZoomOut size={16} strokeWidth={1.75} />
          </button>
          {isZoomed && (
            <button
              type="button"
              onClick={() => setZoom(1)}
              title="Fit page"
              className="h-8 min-w-[44px] rounded-lg px-1.5 text-[12.5px] font-semibold tabular-nums text-subtle transition-colors hover:bg-hover hover:text-ink"
            >
              {Math.round(zoom * 100)}%
            </button>
          )}
          <button
            type="button"
            aria-label="Zoom in"
            className={toolButton}
            onClick={zoomIn}
            disabled={zoom >= ZOOM_MAX}
          >
            <ZoomIn size={16} strokeWidth={1.75} />
          </button>
          <span className="w-px h-5 mx-1.5 bg-line" aria-hidden />
          <button
            type="button"
            aria-label="Close"
            className="w-9 h-9 grid place-items-center rounded-lg text-subtle hover:bg-hover hover:text-ink transition-colors"
            onClick={() => {
              setModalContent(null);
            }}
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>
      </div>
      {/* The preview is exactly as tall as the fitted page; zooming in scrolls inside it. */}
      <div
        className={cn(
          "w-full shrink-0 bg-sunken",
          isZoomed ? "overflow-auto overscroll-contain" : "overflow-hidden",
        )}
        style={{ height: previewHeight, padding: PREVIEW_PAD }}
      >
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess as any}
          options={options}
          onItemClick={(e) => {
            setPageNumber(e.pageNumber);
            setPageInputVal(String(e.pageNumber));
          }}
          loading={
            <div className="grid h-full place-items-center">
              <Spinner size="sm" label="Loading the document" />
            </div>
          }
          className={cn("flex min-h-full", isZoomed ? "w-max min-w-full" : "")}
        >
          <div
            className="m-auto shrink-0 overflow-hidden rounded-[3px] bg-surface shadow-page"
            style={{ width: pageWidth, height: pageHeight }}
          >
            <Page pageNumber={pageNumber} width={pageWidth} loading={null} />
          </div>
        </Document>
      </div>

      <div ref={controlsRef} className="shrink-0">
        <div className="flex flex-col gap-4 px-5 pt-4">
          <div>
            <p
              id="pdf-pages-label"
              className="mb-2 text-[13px] font-semibold text-ink"
            >
              Pages
            </p>
            <div
              role="radiogroup"
              aria-labelledby="pdf-pages-label"
              className="flex w-full gap-0.5 rounded-[10px] bg-sunken p-[3px] sm:w-[260px]"
            >
              {[
                { label: "All", value: "all" },
                { label: "Custom", value: "custom" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={pages === option.value}
                  onClick={() => setPages(option.value)}
                  className={cn(
                    "h-8 flex-1 rounded-lg text-[13px] font-semibold transition-colors",
                    pages === option.value
                      ? "bg-surface text-ink shadow-xs ring-1 ring-control-strong"
                      : "text-subtle hover:text-ink",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {pages === "custom" && (
            <div className="flex gap-3">
              <div style={{ flex: 1 }}>
                <DropDown
                  options={startPageOptions}
                  label="Start page"
                  value={startPage}
                  handleSelect={({ value }) => {
                    setStartPage(value);

                    setEndPage("");

                    const newEndPageOptions = generatePagesOptions(
                      Number(value),
                      totalPages,
                    );
                    setEndPageOptions(newEndPageOptions);
                  }}
                  openFromTop={true}
                />
              </div>

              <div style={{ flex: 1 }}>
                <DropDown
                  options={endPageOptions}
                  label="End page"
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
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => {
              setIsHandWritten(!isHandWritten);
            }}
          >
            <Checkbox checked={isHandWritten} readOnly aria-label="The file is handwritten" />
            <p className="text-sm text-body">
              Please select if the file is handwritten
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2.5 px-5 py-3.5 mt-4 border-t border-line bg-canvas">
          {isExtractingImagesFromPDF ? (
            <div className="h-10 grid place-items-center px-6">
              <Spinner size="sm" label="Getting the pages ready" />
            </div>
          ) : (
            <Button
              disabled={
                isSubmitDisabled ||
                Boolean(startPageError) ||
                Boolean(endPageError) ||
                isExtractingImagesFromPDF
              }
              title="Upload"
              size="medium"
              className="min-w-[140px] max-md:flex-1"
              onClick={async () => {
                if (isHandWritten) {
                  setIsExtractingImagesFromPDF(true);
                  let images = await extractImagesFromPdf(fileUrl);
                  setIsExtractingImagesFromPDF(false);
                  if (startPage.length && endPage.length) {
                    images = images.slice(
                      Number(startPage) - 1,
                      Number(endPage),
                    );
                  }

                  handleUploadPDF(
                    pages,
                    startPage,
                    endPage,
                    isHandWritten,
                    images,
                  );
                } else {
                  handleUploadPDF(pages, startPage, endPage);
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
