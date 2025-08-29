import React, {
  ElementRef,
  FC,
  useCallback,
  useEffect,
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

import { useModalContext } from "@/contexts/ModalContext";
import { DocumentContentModel } from "@/models/document.model";
import AltTabContainer from "@/@shared/components/Tab/AltTabContainer";
import PageControls from "./PageControls";
import cn from "classnames";
import { HighlightableText } from "@/@shared/components/HighlightableText";
import VirtualScroll from "react-dynamic-virtual-scroll";
import TopicsContainer from "./TopicsContainer";

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

const maxWidth = 750;

const PDFReader: FC<Props> = ({
  // modifiedFileUrl,
  originalFileUrl,
  modifiedContent,
}) => {
  const [zoom, setZoom] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageInputVal, setPageInputVal] = useState("1");
  const [totalPages, setTotalPages] = useState(0);
  const [containerWidth, setContainerWidth] = useState<number>();
  const [activeTab, setActiveTab] = useState("Original");
  const [pageHeight, setPageHeight] = useState<number | null>(null);
  const pageRefs = useRef<any>([]);

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
    if (newPage >= 1 && newPage <= totalPages) {
      setPageInputVal(String(newPage)); // Keep the input field updated
      const pageElement = pageRefs.current[newPage - 1]; // Get the DOM element for the target page
      if (pageElement) {
        pageElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const renderModifiedContent = (idx: number) => {
    return (
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 5,
          display: activeTab === "Simplified" ? "flex" : "none",
        }}
        className={cn(
          `overflow-y-auto no-scrollbar md:px-6 bg-white max-w-[800px] mx-auto rounded-lg`,
          {
            ["shadow-md"]: activeTab === "Simplified",
          }
        )}
      >
        <div className="mx-auto">
          <div
            className="w-full mb-4 mx-auto bg-white p-6 no-scrollbar overflow-y-auto min-h-fit py-4 overflow-x-hidden"
            dangerouslySetInnerHTML={{
              __html: modifiedContent.content[idx],
            }}
          ></div>
        </div>
      </div>
    );
  };

  const renderPDF = (fileUrl: string) => (
    <div className="no-scrollbar overflow-y-auto h-full py-4">
      <HighlightableText>
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
          {/* <VirtualScroll
            className="List"
            minItemHeight={20}
            totalLength={totalPages}
            renderItem={(idx: number) => {
              return (
                <div
                  className={cn(
                    "mb-4 relative  flex items-center justify-center"
                  )}
                  key={`page-${idx + 1}`}
                  data-page-number={idx + 1}
                  ref={(el) => {
                    pageRefs.current[idx] = el;
                  }}
                >
                  {renderModifiedContent(idx)}
                  <div
                    className={cn(``, {
                      ["opacity-0"]: activeTab == "Simplified",
                    })}
                  >
                    <Page
                      pageNumber={idx + 1}
                      width={
                        containerWidth
                          ? Math.min(containerWidth, maxWidth)
                          : maxWidth
                      }
                      className={"relative"}
                      scale={zoom}
                    ></Page>
                  </div>
                </div>
              );
            }}
          /> */}
          {new Array(totalPages).fill("").map((_, idx) => {
            return (
              <div
                className={cn(
                  "mb-4 relative  flex items-center justify-center"
                )}
                key={`page-${idx + 1}`}
                data-page-number={idx + 1}
                ref={(el) => {
                  pageRefs.current[idx] = el;
                }}
              >
                {renderModifiedContent(idx)}
                <div
                  className={cn(``, {
                    ["opacity-0"]: activeTab == "Simplified",
                  })}
                >
                  <Page
                    pageNumber={idx + 1}
                    width={
                      containerWidth
                        ? Math.min(containerWidth, maxWidth)
                        : maxWidth
                    }
                    className={"relative"}
                    scale={zoom}
                  ></Page>
                </div>
              </div>
            );
          })}
        </Document>
      </HighlightableText>
    </div>
  );

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
        <div>
          <AltTabContainer
            data={tabs.map((t) => {
              return { isActive: activeTab === t, title: t };
            })}
            handleClick={(tab) => {
              setActiveTab(tab);
            }}
          />
        </div>

        <PageControls
          handlePageInputVal={setPageInputVal}
          goToPage={goToPage}
          pageInputVal={pageInputVal}
          pageNumber={pageNumber}
          totalPages={totalPages}
        />
      </div>
      <div className="flex">
        <div
          className="h-[calc(100vh-52px)] w-full bg-gray-200 overflow-y-auto  no-scrollbar px-2 flex"
          ref={containerRef}
        >
          <motion.div
            key="modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className=" w-full h-full mx-auto "
          >
            {/* PDF Content */}
            <div className="relative w-full h-full max-md:pt-[74px]">
              <div>{renderPDF(originalFileUrl)}</div>
            </div>
          </motion.div>
        </div>

        {/* topics */}

        <TopicsContainer />
      </div>
    </>
  );
};

export default PDFReader;
