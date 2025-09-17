import { useModalContext } from "@/contexts/ModalContext";
import { DocumentContentModel } from "@/models/document.model";
import { useResizeObserver } from "@wojtekmaj/react-hooks";
import React, {
  ElementRef,
  FC,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { pdfjs, Document, Page } from "react-pdf";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { motion } from "framer-motion";
import { HighlightableText } from "@/@shared/components/HighlightableText";
import cn from "classnames";
import PageControls from "../EasyRead/PageControls";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

const options = {
  cMapUrl: "/cmaps/",
  standardFontDataUrl: "/standard_fonts/",
};

const maxWidth = 750;

interface Props {
  fileContent: string[];
  totalPages: number;
}

const SprintReadPDFReader: FC<Props> = ({ fileContent, totalPages }) => {
  const [zoom, setZoom] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageInputVal, setPageInputVal] = useState("1");
  const [containerWidth, setContainerWidth] = useState<number>();
  const pageRefs = useRef<any>([]);

  const containerRef = useRef<ElementRef<"div">>(null);

  const onResize = useCallback<ResizeObserverCallback>((entries) => {
    const [entry] = entries;
    if (entry) {
      setContainerWidth(entry.contentRect.width);
    }
  }, []);

  useResizeObserver(containerRef.current, {}, onResize);

  const zoomChange = 0.2;
  const zoomIn = () => setZoom((z) => z + zoomChange);
  const zoomOut = () => setZoom((z) => Math.max(1, z - zoomChange));

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPageInputVal(String(newPage)); // Keep the input field updated
      const pageElement = pageRefs.current[newPage - 1]; // Get the DOM element for the target page
      if (pageElement) {
        pageElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  useEffect(() => {
    const observerOptions = {
      root: containerRef.current, // The scrollable container
      rootMargin: "0px",
      threshold: 0.5, // Trigger when 50% of the page is visible
    };

    const observers: IntersectionObserver[] = [];

    for (let i = 0; i < totalPages; i++) {
      const pageElement = pageRefs.current[i];
      if (pageElement) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const pageNum = parseInt(
                entry.target.getAttribute("data-page-number") || "1"
              );
              setPageNumber(pageNum);
              setPageInputVal(String(pageNum)); // Update input field too
            }
          });
        }, observerOptions);

        observer.observe(pageElement);
        observers.push(observer);
      }
    }

    return () => {
      // Disconnect all observers when the component unmounts or totalPages changes
      observers.forEach((observer) => observer.disconnect());
    };
  }, [totalPages, containerWidth]);

  return (
    <>
      <div className="z-10 max-md:shadow-lg max-md:w-full max-md:fixed w-fit mx-auto flex items-center max-md:justify-center max-md:py-1 gap-4 md:absolute md:top-1 left-1/2  -translate-x-1/2 md:rounded-md bg-white">
        <PageControls
          handlePageInputVal={setPageInputVal}
          goToPage={goToPage}
          pageInputVal={pageInputVal}
          pageNumber={pageNumber}
          totalPages={totalPages}
        />
      </div>

      {/* modified */}
      <div className="overflow-y-auto flex flex-col py-7 gap-5 no-scrollbar md:px-6 bg-gray-200  mx-auto rounded-lg">
        {fileContent.map((content, idx) => {
          return (
            <div className="mx-auto" key={idx}>
              <div
                className="w-full border-b border-b-gray-300 mb-4 mx-auto bg-white max-w-[800px] p-6 no-scrollbar overflow-y-auto min-h-fit py-4 overflow-x-hidden"
                dangerouslySetInnerHTML={{ __html: content }}
              ></div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default SprintReadPDFReader;
