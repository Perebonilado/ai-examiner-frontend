import UploadIcon from "@/icons/UploadIcon";
import React, { ElementRef, FC, useEffect, useRef, useState } from "react";
import Button from "../ui/Button";
import { toast } from "react-toastify";
import TransitionUp from "@/transitions/TransitionUp";
import AttachedFileInfo from "./AttachedFileInfo";
import { convertMegaBytesToBytes, getFileNameWithoutExtension } from "@/utils";
import Spinner from "./Spinner";
import { useModalContext } from "@/contexts/ModalContext";
import PDFViewer from "@/@modules/home/PDFViewer";
import Tesseract from "tesseract.js";

import { pdfjs } from "react-pdf";
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
}

const UploadFileBox: FC<Props> = ({
  allowedTypes,
  attachedFile,
  handleDeleteFile,
  handleSelectFile,
  uploadLoading,
  maxFileSizeMB = 10,
}) => {
  const inputRef = useRef<ElementRef<"input">>(null);
  const validateFileSize = (file: File) => {
    const maxSizeInBytes = convertMegaBytesToBytes(maxFileSizeMB);
    if (file.size > maxSizeInBytes) {
      return false;
    } else {
      return true;
    }
  };
  const [pdfProcessing, setPdfProcessing] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [ocrProgress, setOcrProgress] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { setModalContent } = useModalContext();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (e.target.files) {
        const file = e.target.files[0];
        if (file && validateFileSize(file)) {
          if (file.type.includes("pdf")) {
            const fileUrl = URL.createObjectURL(file);
            setModalContent(
              <PDFViewer
                fileUrl={fileUrl}
                handleUploadPDF={async (pages, start, end) => {
                  setModalContent(null);
                  setPdfProcessing(true);
                  const text = await extractText(
                    file,
                    Number(start),
                    Number(end)
                  );
                  if (!text.trim().length) {
                    const scannedText = await extractTextFromScannedPdf(
                      file,
                      Number(start),
                      Number(end),
                      (progress) => {
                        setOcrProgress(progress);
                      }
                    );

                    if (!scannedText.trim().length) {
                      toast.error("Error processing file");
                      setOcrProgress(null);
                      setPdfProcessing(false);
                      return;
                    }

                    const newTxtFile = createFileFromText(
                      scannedText.trim(),
                      `${getFileNameWithoutExtension(file.name)}.txt`
                    );

                    setPdfProcessing(false);
                    setOcrProgress(null);

                    if (newTxtFile) {
                      handleSelectFile(newTxtFile);

                      return;
                    }
                  }

                  const newTxtFile = createFileFromText(
                    text,
                    `${getFileNameWithoutExtension(file.name)}.txt`
                  );
                  setPdfProcessing(false);
                  if (newTxtFile) {
                    handleSelectFile(newTxtFile);
                  }
                  setModalContent(null);
                }}
              />
            );
          } else {
            handleSelectFile(e.target.files[0]);
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

  return isClient ? (
    <>
      <input
        ref={inputRef}
        type="file"
        onChange={async (e) => {
          await handleFileChange(e);
        }}
        className="hidden"
        accept={allowedTypes.map((t) => `.${t}`).join(", ")}
      />
      <div>
        <label className={`text-base font-semibold mb-2 block`}>
          Upload Study Document
        </label>
        <div className="w-full p-6 h-[300px] bg-gray-50 border border-opacity-45 border-gray-300 rounded-xl flex flex-col items-center justify-center gap-4">
          {!attachedFile && !uploadLoading && !pdfProcessing && (
            <UploadIcon width={80} height={80} />
          )}
          {!attachedFile && !uploadLoading && !pdfProcessing && (
            <div className="flex flex-col justify-center gap-3">
              <Button
                onClick={() => {
                  inputRef.current?.click();
                }}
                title="Click to upload file"
                size="large"
                variant="outlined"
                type="button"
              />
              <p className="text-xs italic">
                Maximum File Size: {maxFileSizeMB}mb | Allowed File Types: pdf,
                docx, pptx, txt
              </p>
            </div>
          )}

          {attachedFile && !uploadLoading && !pdfProcessing && (
            <TransitionUp>
              <AttachedFileInfo
                handleDelete={() => {
                  handleDeleteFile();
                  if (inputRef.current && inputRef.current.value)
                    inputRef.current.value = "";
                }}
                fileName={attachedFile.name}
              />
            </TransitionUp>
          )}
          {attachedFile && uploadLoading && (
            <div className="flex flex-col items-center justify-center gap-3">
              <Spinner />
              <p className="text-center truncate text-xs font-semibold">
                File upload in progess...
              </p>
            </div>
          )}
          {pdfProcessing && (
            <div className="flex flex-col items-center justify-center gap-3">
              <Spinner />
              <p className="text-center truncate text-xs font-semibold">
                Processing File {ocrProgress && ocrProgress}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  ) : (
    <></>
  );
};

export default UploadFileBox;

async function extractTextFromScannedPdf(
  pdfFile: File,
  start: number,
  end: number,
  handleProgress?: (progress: string) => void
): Promise<string> {
  const SCALE = 1.2; // Slightly downscaled for better memory efficiency
  const MAX_CONCURRENT_OCR = 3; // Limit OCR concurrency for memory optimization

  const canvas = document.createElement("canvas");
  try {
    const pdfData = new Uint8Array(await pdfFile.arrayBuffer());
    const pdf = await pdfjs.getDocument({ data: pdfData }).promise;

    const context = canvas.getContext("2d", {
      alpha: false,
      willReadFrequently: true,
    });

    let fullText = "";
    let pendingOCRPromises: Promise<string>[] = [];

    const numPages = pdf.numPages;
    const endIndex = end ? end : numPages;
    const startIndex = start ? start : 1;

    const pages: number[] = [];

    for (let i = startIndex; i <= endIndex; i++) {
      pages.push(i);
    }

    for (const pageNumber of pages) {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: SCALE });

      // Set canvas size to match page viewport dimensions
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Render page to canvas
      await page.render({
        canvasContext: context!,
        viewport,
      }).promise;

      // Compress and prepare blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) =>
            blob ? resolve(blob) : reject(new Error("Blob conversion failed")),
          "image/jpeg",
          0.6
        );
      });

      // OCR operation with limited concurrency
      const ocrPromise = Tesseract.recognize(blob, "eng")
        .then(({ data: { text } }) => {
          return text;
        })
        .catch((error) => {
          console.error(`Error processing page ${pageNumber}:`, error);
          return ""; // Skip this page on error
        });

      pendingOCRPromises.push(ocrPromise);

      // Limit concurrent OCR operations
      if (
        pendingOCRPromises.length >= MAX_CONCURRENT_OCR ||
        pageNumber === endIndex
      ) {
        const ocrResults = await Promise.all(pendingOCRPromises);
        fullText += ocrResults.join("\n\n");
        pendingOCRPromises = []; // Reset for next batch
      }

      // Progress tracking (for browsers)
      if (typeof window !== "undefined") {
        const progress = Math.round((pageNumber / endIndex) * 100);
        if (handleProgress) handleProgress(`${progress}%`);
      }
    }

    return fullText.trim();
  } catch (error) {
    throw new Error(`Failed to extract text: ${(error as Error).message}`);
  } finally {
    // Clean up
    canvas.width = 0;
    canvas.height = 0;
  }
}

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

          textContent.items.forEach((item: any) => {
            const { str } = item;
            extractedText += str + " ";
          });
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
