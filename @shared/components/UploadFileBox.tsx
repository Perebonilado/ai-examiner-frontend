import React, { ElementRef, FC, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import TransitionUp from "@/transitions/TransitionUp";
import AttachedFileInfo from "./AttachedFileInfo";
import {
  bytesToMegabytes,
  convertMegaBytesToBytes,
  getFileNameWithoutExtension,
} from "@/utils";
import { useModalContext } from "@/contexts/ModalContext";
import PDFViewer from "@/@modules/home/PDFViewer";
import { pdfjs } from "react-pdf";
import ChooseFileTypeBox from "./ChooseFileTypeBox";
import useClickOutside from "@/hooks/useClickOutside";
import StagedImageItemContainer from "./StagedImageItemContainer";
import { StagedImage } from "./StagedImageItem";
import FileUploadSpinner from "./FileUploadSpinner";
import FileTypeTile, { getFileTypeTileExt } from "./FileTypeTile";
import { ArrowUp, ChevronDown, Upload } from "lucide-react";
import { motion } from "framer-motion";
import cn from "classnames";
import ProcessedWritingContainer from "./HandWritten/ProcessedWritingContainer";
import { useExteactWrittenTextMutation } from "@/api-services/file-upload.service";
import ProcessingHandWrittenImagesLoader from "./HandWritten/ProcessingHandWrittenImagesLoader";
pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

const options = {
  cMapUrl: "/cmaps/",
  standardFontDataUrl: "/standard_fonts/",
};

interface Props {
  handleSelectFile: (
    file: File,
    pages?: string,
    start?: string,
    end?: string
  ) => void;
  handleDeleteFile: () => void;
  attachedFile: File | null;
  allowedTypes: string[];
  uploadLoading: boolean;
  maxFileSizeMB?: number;
  disableUpload: boolean;
}

const UploadFileBox: FC<Props> = ({
  allowedTypes,
  attachedFile,
  handleDeleteFile,
  handleSelectFile,
  uploadLoading,
  maxFileSizeMB = 10,
  disableUpload,
}) => {
  const filesRef = useRef<ElementRef<"input">>(null);
  const imagesRef = useRef<ElementRef<"input">>(null);
  const validateFileSize = (fileSize: number) => {
    const maxSizeInBytes = convertMegaBytesToBytes(maxFileSizeMB);
    if (fileSize > maxSizeInBytes) {
      return false;
    } else {
      return true;
    }
  };
  const [pdfProcessing, setPdfProcessing] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [ocrProgress, setOcrProgress] = useState<string | null>(null);
  const [isChooseFileTypePopUp, setIsChooseFileTypePopUp] = useState(false);
  const uploadButtonContainerRef = useClickOutside<ElementRef<"div">>(() => {
    setIsChooseFileTypePopUp(false);
  });
  const [stagedImages, setStagedImages] = useState<StagedImage[] | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { setModalContent } = useModalContext();

  useEffect(() => {
    if (stagedImages) {
      const currentFileSizeBytes = stagedImages.reduce(
        (acc, b) => acc + b.file.size,
        0
      );
      const currentFileSizeMb = Number(
        bytesToMegabytes(currentFileSizeBytes).toFixed(2)
      );

      setModalContent(
        <StagedImageItemContainer
          data={stagedImages}
          handleDelete={(id) => {
            const filteredStagedFiles = stagedImages.filter(
              (img) => img.id !== id
            );

            setStagedImages(filteredStagedFiles);

            if (filteredStagedFiles.length === 0) {
              setModalContent(null);
              setStagedImages(null);
            }
          }}
          handleUploadFiles={async (blob, isHandWritten, convertedImages) => {
            const file = new File([blob], "Untitled", {
              type: "application/pdf",
              lastModified: new Date().getTime(),
            });
            if (isHandWritten) {
              const formData = new FormData();

              formData.append("document", file);

              if (convertedImages?.length) {
                setPdfExtractedImages(convertedImages);
              }

              extractHandWrittenText({ payload: formData });

              setModalContent(null);

              return;
            }
            handleSelectFile(file);
            setModalContent(null);
          }}
          allowedFileSize={maxFileSizeMB}
          currentFileSize={currentFileSizeMb}
          handleCancel={() => {
            setModalContent(null);
            setStagedImages(null);
          }}
        />
      );
    }
  }, [stagedImages]);

  const stageImages = (files: FileList | File[]) => {
    try {
      if (files.length) {
        const stagedFiles: { id: number; file: File }[] = [];
        for (let i = 0; i < files.length; i++) {
          stagedFiles.push({
            id: i,
            file: files[i],
          });
        }
        setStagedImages(stagedFiles);
      }
    } catch (error) {
      toast.error(("An error occured while attaching file " + error) as string);
    }
  };

  const handleImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) stageImages(e.target.files);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await attachFile(e.target.files?.[0]);
  };

  const attachFile = async (file?: File | null) => {
    try {
      if (file) {
        if (file && validateFileSize(file.size)) {
          if (file.type.includes("pdf")) {
            const fileUrl = URL.createObjectURL(file);
            setModalContent(
              <PDFViewer
                fileUrl={fileUrl}
                handleUploadPDF={async (
                  pages,
                  start,
                  end,
                  isHandWritten,
                  images
                ) => {
                  if (isHandWritten) {
                    const formData = new FormData();

                    formData.append("document", file);
                    if (images) {
                      setPdfExtractedImages(images);
                    }

                    setExtractedWrittenTextTitle(
                      getFileNameWithoutExtension(file.name)
                    );

                    extractHandWrittenText({ payload: formData, start, end });

                    setModalContent(null);

                    return;
                  }
                  handleSelectFile(file, pages, start, end);
                  setModalContent(null);
                }}
              />
            );
          } else {
            handleSelectFile(file);
          }
          return;
        } else {
          toast.error(`File Size must be ${maxFileSizeMB}mb or less`);
        }
      }
    } catch (error) {
      setPdfProcessing(false);
      toast.error(("An error occured while attaching file " + error) as string);
    }
  };

  const [
    extractHandWrittenText,
    {
      isLoading: extractingText,
      error: extractingTextError,
      data: extractedText,
    },
  ] = useExteactWrittenTextMutation();

  const [showWritingReview, setShowWritingReview] = useState(false);

  useEffect(() => {
    if (extractedText) {
      setShowWritingReview(true);
    }
  }, [extractedText]);

  const [pdfExtractedImages, setPdfExtractedImages] = useState<string[]>([]);
  const [extractedWrittenTextTitle, setExtractedWrittenTextTitle] =
    useState<string>("Untitled");

  const imageExtensions = ["png", "jpg", "jpeg", "heic"];
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (attachedFile || uploadLoading) return;
    if (disableUpload) {
      toast.error("Please wait until your test is ready");
      return;
    }
    const dropped = Array.from(e.dataTransfer.files || []);
    if (!dropped.length) return;
    const extOf = (f: File) =>
      (f.name.split(".").pop() || "").toLowerCase();
    const images = dropped.filter((f) => imageExtensions.includes(extOf(f)));
    if (images.length === dropped.length) {
      stageImages(images);
      return;
    }
    const file = dropped.find((f) => allowedTypes.includes(extOf(f)));
    if (!file) {
      toast.error(
        `Please upload one of: ${[...allowedTypes, "png", "jpg"].join(", ")}`
      );
      return;
    }
    await attachFile(file);
  };

  const isEmpty = !attachedFile && !uploadLoading && !pdfProcessing;

  return isClient ? (
    <>
      {extractingText && <ProcessingHandWrittenImagesLoader />}
      {extractedText && showWritingReview && (
        <ProcessedWritingContainer
          images={
            pdfExtractedImages.length
              ? pdfExtractedImages
              : (stagedImages as StagedImage[]).map((img) => {
                  return URL.createObjectURL(img.file);
                })
          }
          textContent={extractedText}
          handleClose={() => {
            setShowWritingReview(false);
            setExtractedWrittenTextTitle("Untitled");
          }}
          handleUpload={(content) => {
            const file = createFileFromText(
              content.join("\n"),
              extractedWrittenTextTitle
            );
            if (file) {
              handleSelectFile(file);
              setShowWritingReview(false);
              setExtractedWrittenTextTitle("Untitled");
              setPdfExtractedImages([]);
            }
          }}
        />
      )}
      <input
        ref={filesRef}
        type="file"
        onChange={async (e) => {
          await handleFileChange(e);
        }}
        className="hidden"
        accept={allowedTypes.map((t) => `.${t}`).join(", ")}
      />
      <input
        ref={imagesRef}
        type="file"
        onChange={async (e) => {
          await handleImagesChange(e);
        }}
        className="hidden"
        accept=".png, .jpeg, .jpg, .heic"
        multiple
      />
      <div
        className={cn(
          "group relative isolate flex flex-col items-center justify-center text-center rounded-[22px] max-md:rounded-[18px] transition-[background-color,box-shadow] duration-200",
          "min-h-[300px] max-md:min-h-[270px] px-6 max-md:px-[18px]",
          {
            "pt-12 pb-[30px] max-md:pt-8 max-md:pb-[26px] bg-canvas hover:shadow-[0_16px_36px_-26px_rgba(16,12,40,0.28)]":
              isEmpty,
            "py-[30px] max-md:py-[26px] bg-surface": !isEmpty,
            "!bg-surface": isDragOver,
            // lift above the fields below while the Browse files menu is open
            "z-10": isChooseFileTypePopUp,
          }
        )}
        onDragOver={(e) => {
          if (!isEmpty) return;
          e.preventDefault();
          if (!isDragOver) setIsDragOver(true);
        }}
        onDragLeave={(e) => {
          if (e.currentTarget.contains(e.relatedTarget as Node)) return;
          setIsDragOver(false);
        }}
        onDrop={handleDrop}
      >
        {/* dashed border (an SVG so the dashes are rounded and evenly spaced) */}
        <svg
          aria-hidden="true"
          className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
        >
          <rect
            width="100%"
            height="100%"
            rx="22"
            ry="22"
            fill="none"
            stroke={isDragOver ? "var(--accent)" : "var(--accent-300)"}
            strokeWidth={isDragOver ? 2 : 1.6}
            strokeDasharray="6 7"
            strokeLinecap="round"
          />
        </svg>

        {isEmpty && (
          <>
            <div
              aria-hidden="true"
              className="relative flex items-end justify-center h-[78px] max-md:h-14 mt-3.5 mb-5 max-md:mt-2 max-md:mb-3.5"
            >
              {(["PPTX", "DOCX", "PDF", "JPG"] as const).map((ext, i) => (
                <span
                  key={ext}
                  className={cn(
                    "relative -mx-[3px] [filter:drop-shadow(0_1px_0_rgba(16,12,40,0.06))_drop-shadow(0_8px_14px_rgba(16,12,40,0.12))] transition-transform duration-[350ms] ease-out-expo motion-reduce:transition-none",
                    [
                      "z-0 rotate-[-13deg] translate-x-1 translate-y-[9px] group-hover:rotate-[-17deg] group-hover:-translate-x-1 group-hover:translate-y-1.5",
                      "z-[1] rotate-[-4.5deg] translate-y-px group-hover:rotate-[-6deg] group-hover:-translate-y-1",
                      "z-[2] rotate-[4.5deg] translate-y-px group-hover:rotate-[6deg] group-hover:-translate-y-1",
                      "z-[1] rotate-[13deg] -translate-x-1 translate-y-[9px] group-hover:rotate-[17deg] group-hover:translate-x-1 group-hover:translate-y-1.5",
                    ][i]
                  )}
                >
                  <FileTypeTile ext={ext} size="fan" />
                </span>
              ))}
              <span className="absolute left-1/2 -top-[22px] -translate-x-1/2 z-[5] w-[34px] h-[34px] rounded-full grid place-items-center bg-accent text-white shadow-[0_0_0_4px_var(--surface),0_4px_10px_-4px_rgba(16,12,40,0.25)]">
                <ArrowUp size={17} strokeWidth={2.4} />
              </span>
            </div>
            <p className="text-lg font-bold text-ink tracking-[-0.015em]">
              Upload your material here
            </p>
            <p className="mt-1.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-[13px] text-muted">
              <span className="tabular-nums">Max size: {maxFileSizeMB}mb</span>
              <span className="w-[3px] h-[3px] rounded-full bg-control" />
              <span>pdf, docx, pptx, ppt, png, jpg, txt</span>
            </p>

            <div className="relative mt-[22px]" ref={uploadButtonContainerRef}>
              <button
                onClick={() => {
                  if (disableUpload) {
                    toast.error("Please wait until your test is ready");
                    return;
                  }
                  setIsChooseFileTypePopUp(!isChooseFileTypePopUp);
                }}
                type="button"
                aria-haspopup="menu"
                aria-expanded={isChooseFileTypePopUp}
                className="inline-flex items-center gap-2 h-[42px] pl-4 pr-3.5 rounded-full bg-brand hover:bg-brand-hover text-white text-sm font-semibold whitespace-nowrap shadow-xs transition-colors active:translate-y-[0.5px]"
              >
                <Upload size={16} strokeWidth={1.75} aria-hidden />
                Browse files
                <ChevronDown
                  size={16}
                  strokeWidth={1.75}
                  className={cn("text-white/80 transition-transform", {
                    "rotate-180": isChooseFileTypePopUp,
                  })}
                  aria-hidden
                />
              </button>
              {isChooseFileTypePopUp && (
                <ChooseFileTypeBox
                  handleSelectFiles={() => {
                    filesRef.current?.click();
                    setIsChooseFileTypePopUp(false);
                  }}
                  handleSelectImages={() => {
                    imagesRef?.current?.click();
                  }}
                />
              )}
            </div>
            <p className="mt-2.5 text-[13px] text-muted">
              or drag and drop it here
            </p>
          </>
        )}

        {attachedFile && uploadLoading && (
          <div className="flex flex-col items-center w-full" role="status">
            <FileTypeTile
              ext={getFileTypeTileExt(attachedFile.name, attachedFile.type)}
              size="lg"
            />
            <p className="mt-3.5 text-lg font-bold text-ink tracking-[-0.015em]">
              File upload in progress
            </p>
            <p className="mt-1.5 max-w-[280px] text-[13px] text-muted truncate">
              {attachedFile.name}
            </p>
            <div className="relative mt-4 w-full max-w-[260px] h-1.5 rounded-full bg-sunken overflow-hidden">
              <motion.span
                className="absolute inset-y-0 left-0 w-2/5 rounded-full bg-accent"
                initial={{ x: "-100%" }}
                animate={{ x: "250%" }}
                transition={{
                  duration: 1.3,
                  ease: "easeInOut",
                  repeat: Infinity,
                }}
              />
            </div>
          </div>
        )}

        {pdfProcessing && (
          <FileUploadSpinner
            title={`Processing File ${ocrProgress && ocrProgress}`}
          />
        )}

        {attachedFile && !uploadLoading && !pdfProcessing && (
          <TransitionUp className="w-full">
            <AttachedFileInfo
              handleDelete={() => {
                handleDeleteFile();
                if (filesRef.current && filesRef.current.value) {
                  filesRef.current.value = "";
                }

                if (imagesRef.current && imagesRef.current.value) {
                  imagesRef.current.value = "";
                }
              }}
              fileName={attachedFile.name}
              fileType={attachedFile.type}
            />
          </TransitionUp>
        )}
      </div>
    </>
  ) : (
    <></>
  );
};

export default UploadFileBox;

const createFileFromText = (
  text: string,
  fileName: string,
  mimeType: string = "text/plain"
) => {
  // Validate text content is non-empty
  if (!text?.trim().length) {
    toast.error("Text content cannot be empty or contain only whitespace");
    return;
  }

  if (!fileName || typeof fileName !== "string") {
    toast.error("File name is required and must be a string");
    return;
  }

  // Create Blob with the validated text content
  const blob = new Blob([text], { type: mimeType });

  // Verify blob size as a safety check
  if (blob.size === 0) {
    toast.error("Failed to create file: resulting blob is empty");
    return;
  }

  // Create File object from Blob
  const file = new File([blob], fileName, {
    type: mimeType,
    lastModified: new Date().getTime(),
  });

  return file;
};

const extractText = (
  file: File,
  startPage = 1,
  endPage?: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    let extractedText = "";

    reader.onload = async (e) => {
      try {
        const typedarray = new Uint8Array(e.target?.result as ArrayBuffer);
        const pdf = await pdfjs.getDocument({ data: typedarray }).promise;
        const numPages = pdf.numPages;
        const endIndex = endPage ? endPage : numPages;
        const startIndex = startPage ? startPage : 1;

        const pages: number[] = [];

        for (let i = startIndex; i <= endIndex; i++) {
          pages.push(i);
        }

        for (const pageNumber of pages) {
          const page = await pdf.getPage(pageNumber);
          const textContent = await page.getTextContent();
          let pageContent = "";
          textContent.items.forEach((item: any) => {
            const { str } = item;
            pageContent += str + " ";
          });
          extractedText += pageContent + "\n \n";
        }

        resolve(extractedText);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);

    reader.readAsArrayBuffer(file);
  });
};
