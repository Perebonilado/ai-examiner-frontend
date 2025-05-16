import React, {
  ElementRef,
  FC,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { pdfjs, Document, Page } from "react-pdf";
import { useResizeObserver } from "@wojtekmaj/react-hooks";
import { motion } from "framer-motion";
import type { PDFDocumentProxy } from "pdfjs-dist";

import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

import CloseIcon from "@/icons/CloseIcon";
import ChevronLeft from "@/icons/ChevronLeft";
import ZoomOutIcon from "@/icons/ZoomOutIcon";
import ZoomInIcon from "@/icons/ZoomInIcon";
import Button from "@/@shared/ui/Button";
import { useModalContext } from "@/contexts/ModalContext";
import { HighlightableTextArea } from "react-highlight-popover";
import TextSelectionPopup from "@/@shared/components/TextSelectionPopUp";
import { DocumentContentModel } from "@/models/document.model";
import AltTabContainer from "@/@shared/components/Tab/AltTabContainer";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface Props {
  // modifiedFileUrl: string;
  originalFileUrl: string;
  modifiedContent: DocumentContentModel;
}

const options = {
  cMapUrl: "/cmaps/",
  standardFontDataUrl: "/standard_fonts/",
};

const maxWidth = 600;

const PDFReader: FC<Props> = ({
  // modifiedFileUrl,
  originalFileUrl,
  modifiedContent,
}) => {
  const [zoom, setZoom] = useState(1.1);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageInputVal, setPageInputVal] = useState("1");
  const [totalPages, setTotalPages] = useState(0);
  const [containerWidth, setContainerWidth] = useState<number>();
  const [activeTab, setActiveTab] = useState("Original");
  const [pageHeight, setPageHeight] = useState<number | null>(null);

  const { setModalContent } = useModalContext();
  const containerRef = useRef<ElementRef<"div">>(null);

  const tabs = ["Original", "Simplified"];

  const onResize = useCallback<ResizeObserverCallback>((entries) => {
    const [entry] = entries;
    if (entry) {
      setContainerWidth(entry.contentRect.width);
    }
  }, []);

  useResizeObserver(containerRef.current, {}, onResize);

  const onDocumentLoadSuccess = ({ numPages }: PDFDocumentProxy) => {
    setTotalPages(numPages);
  };

  const zoomChange = 0.2;
  const zoomIn = () => setZoom((z) => z + zoomChange);
  const zoomOut = () => setZoom((z) => Math.max(1, z - zoomChange));

  const goToPage = (newPage: number) => {
    setPageNumber(newPage);
    setPageInputVal(String(newPage));
  };

  const renderPDF = (fileUrl: string) => (
    <div
      ref={containerRef}
      className="min-w-full no-scrollbar overflow-y-auto h-full flex justify-center py-4 overflow-x-hidden"
    >
      <Document
        file={fileUrl}
        renderMode="canvas"
        onLoadSuccess={onDocumentLoadSuccess as any}
        onLoadError={(error) => {
          console.log("error", error);
        }}
        options={options}
        onItemClick={(e) => goToPage(e.pageNumber)}
      >
        <HighlightableTextArea
          popoverItem={(HighlightedText, setPopoverState) => {
            return (
              <TextSelectionPopup
                selectedText={HighlightedText}
                clearSelection={() => {
                  setPopoverState(false);
                }}
              />
            );
          }}
        >
          <Page
            pageNumber={pageNumber}
            width={
              containerWidth ? Math.min(containerWidth, maxWidth) : maxWidth
            }
            scale={zoom}
          />
        </HighlightableTextArea>
      </Document>
    </div>
  );

  return (
    <motion.div
      key="modal"
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 50, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col bg-white rounded-2xl overflow-hidden shadow-lg w-[97vw] max-w-[1200px] h-[95vh] max-sm:!-translate-y-[30px] max-sm:h-[80vh]"
    >
      {/* Header */}
      {/* Tabs */}
      <div className="border-b pt-1 relative">
        <div className="w-fit mx-auto py-4 flex gap-4">
          <AltTabContainer
            data={tabs.map((t) => {
              return { isActive: activeTab === t, title: t };
            })}
            handleClick={(tab) => {
              setActiveTab(tab);
            }}
          />
        </div>
        <button
          className="absolute right-6 top-1/2 -translate-y-1/2"
          onClick={() => {
            setModalContent(null);
          }}
        >
          <CloseIcon />
        </button>
      </div>

      {/* PDF Content */}
      <div className="relative w-full h-full ">
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: activeTab === "Original" ? 10 : 0,
            visibility: activeTab === "Original" ? "visible" : "hidden",
          }}
        >
          {renderPDF(originalFileUrl)}
        </div>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: activeTab === "Simplified" ? 10 : 0,
            visibility: activeTab === "Simplified" ? "visible" : "hidden",
          }}
          className="overflow-y-auto no-scrollbar px-6"
        >
          <HighlightableTextArea
            popoverItem={(HighlightedText, setPopoverState) => {
              return (
                <TextSelectionPopup
                  selectedText={HighlightedText}
                  clearSelection={() => {
                    setPopoverState(false);
                  }}
                />
              );
            }}
          >
            <div
              className="w-full max-w-[800px] mx-auto no-scrollbar overflow-y-auto min-h-fit py-4 overflow-x-hidden"
              dangerouslySetInnerHTML={{
                __html: modifiedContent.content[pageNumber - 1],
              }}
            ></div>
          </HighlightableTextArea>
          {/* {renderPDF(modifiedFileUrl)} */}
        </div>
      </div>

      <div className="flex justify-center  px-4 py-3 bg-white z-10 border-t">
        <div className="flex items-center gap-3 text-sm h-full">
          <div className="text-gray-700">Page</div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => pageNumber > 1 && goToPage(pageNumber - 1)}
              className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-md flex items-center justify-center shadow-sm"
              title="Previous Page"
            >
              <ChevronLeft fill="#374151" />
            </button>

            <div className="w-[56px] h-8 bg-gray-200 rounded-md flex items-center justify-center px-1 shadow-sm">
              <input
                type="text"
                className="w-full text-center text-sm font-semibold bg-transparent outline-none focus:ring-2 focus:ring-indigo-400 rounded-md"
                value={pageInputVal}
                onChange={(e) => {
                  const val = e.target.value.trim();
                  if (/^\d*$/.test(val)) setPageInputVal(val);
                }}
                onBlur={(e) => {
                  const val = parseInt(e.target.value.trim(), 10);
                  if (val >= 1 && val <= totalPages) {
                    goToPage(val);
                  } else {
                    setPageInputVal(String(pageNumber));
                  }
                }}
              />
            </div>

            <button
              onClick={() =>
                pageNumber < totalPages && goToPage(pageNumber + 1)
              }
              className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-md flex items-center justify-center shadow-sm rotate-180"
              title="Next Page"
            >
              <ChevronLeft fill="#374151" />
            </button>
          </div>

          <div className="text-gray-500 ml-1">of {totalPages}</div>
        </div>
      </div>
    </motion.div>
  );
};

export default PDFReader;
