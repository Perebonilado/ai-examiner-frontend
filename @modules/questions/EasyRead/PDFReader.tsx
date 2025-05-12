import React, { FC, useCallback, useMemo, useState } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import { useResizeObserver } from "@wojtekmaj/react-hooks";
import { motion, AnimatePresence } from "framer-motion";
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

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface Props {
  modifiedFileUrl: string;
  originalFileUrl: string;
}

const options = {
  cMapUrl: "/cmaps/",
  standardFontDataUrl: "/standard_fonts/",
};

const maxWidth = 800;

const PDFReader: FC<Props> = ({ modifiedFileUrl, originalFileUrl }) => {
  const [zoom, setZoom] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageInputVal, setPageInputVal] = useState("1");
  const [totalPages, setTotalPages] = useState(0);
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>();
  const [activeTab, setActiveTab] = useState("Original");
  const [pageHeight, setPageHeight] = useState<number | null>(null);

  const { setModalContent } = useModalContext();

  const tabs = ["Original", "Simplified", "Key Points"];

  const onResize = useCallback<ResizeObserverCallback>((entries) => {
    const [entry] = entries;
    if (entry) {
      setContainerWidth(entry.contentRect.width);
    }
  }, []);

  useResizeObserver(containerRef, {}, onResize);

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
    <div className="min-w-full flex justify-center py-4 overflow-x-hidden">
      <Document
        file={fileUrl}
        onLoadSuccess={onDocumentLoadSuccess as any}
        onLoadError={(error) => {
          console.log("error", error);
        }}
        options={options}
        onItemClick={(e) => goToPage(e.pageNumber)}
      >
        <Page
          pageNumber={pageNumber}
          width={containerWidth ? Math.min(containerWidth, maxWidth) : maxWidth}
          scale={zoom}
          
          onRenderSuccess={({ height }) => {
            if (!pageHeight || height > pageHeight) {
              setPageHeight(height);
            }
          }}
        />
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
      className="flex flex-col bg-white rounded-2xl overflow-hidden shadow-lg max-w-[97vw] w-full max-h-[95vh]"
    >
      {/* Header */}
      <div className="flex justify-between items-center h-[50px] px-4 pt-3 bg-white z-10">
        <div className="flex items-center gap-3 text-sm">
          <p className="text-gray-700">Page</p>
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

          <p className="text-gray-500 ml-1">of {totalPages}</p>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={zoomOut} title="Zoom Out">
            <ZoomOutIcon />
          </button>
          <button onClick={zoomIn} title="Zoom In">
            <ZoomInIcon />
          </button>
          <button onClick={() => setModalContent(null)} title="Close">
            <CloseIcon />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b pt-1">
        <div className="w-fit mx-auto py-4 flex gap-4">
          {tabs.map((tab) => (
            <Button
              key={tab}
              title={tab}
              variant={activeTab === tab ? "contained" : "outlined"}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </Button>
          ))}
        </div>
      </div>

      {/* PDF Content */}
      <HighlightableTextArea
        popoverItem={(HighlightedText, setPopoverState) => (
          <TextSelectionPopup
            selectedText={HighlightedText}
            clearSelection={() => setPopoverState(false)}
          />
        )}
      >
        <div
          ref={setContainerRef}
          className="flex-1 overflow-y-auto bg-[#FAFAFA] overflow-x-hidden"
          style={{
            minHeight: pageHeight ? `${pageHeight + 32}px` : "auto", // Prevent height jumps
          }}
        >
          <div
            className="flex transition-transform duration-500 ease-in-out min-w-full"
            style={{
              transform: `translateX(-${
                tabs.findIndex((t) => t === activeTab) * 100
              }%)`,
            }}
          >
            {renderPDF(originalFileUrl)}
            {renderPDF(modifiedFileUrl)}
            {renderPDF(modifiedFileUrl)}
          </div>
        </div>
      </HighlightableTextArea>
    </motion.div>
  );
};

export default PDFReader;
