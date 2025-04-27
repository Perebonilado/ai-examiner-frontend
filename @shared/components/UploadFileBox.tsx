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
import PowerPointIcon from "@/icons/PowerPointIcon";
import MsWordIcon from "@/icons/MsWordIcon";
import PDFIconAlt from "@/icons/PDFIconAlt";
import JPGIcon from "@/icons/JPGIcon";
import FileUploadSpinner from "./FileUploadSpinner";
import ProcessedWritingContainer from "./HandWritten/ProcessedWritingContainer";
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
          handleUploadFiles={async (blob) => {
            const file = new File([blob], "Untitled", {
              type: "application/pdf",
              lastModified: new Date().getTime(),
            });
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

  const handleImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (e.target.files?.length) {
        const stagedFiles: { id: number; file: File }[] = [];
        for (let i = 0; i < e.target.files.length; i++) {
          stagedFiles.push({
            id: i,
            file: e.target.files[i],
          });
        }
        setStagedImages(stagedFiles);
      }
    } catch (error) {
      toast.error(("An error occured while attaching file " + error) as string);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (e.target.files) {
        const file = e.target.files[0];
        if (file && validateFileSize(file.size)) {
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
                  const keywords = ["cam scanner", "camscanner"];
                  const isCamScanned =
                    text.toLowerCase().includes(keywords[0]) ||
                    text.toLowerCase().includes(keywords[1]);

                  if (isCamScanned) {
                    setPdfProcessing(false);
                    setOcrProgress(null);
                    handleSelectFile(file, pages, start, end);
                    setModalContent(null);
                    return;
                  }

                  if (!text.trim().length) {
                    setPdfProcessing(false);
                    setOcrProgress(null);
                    handleSelectFile(file, pages, start, end);
                    setModalContent(null);
                    return;
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
      <ProcessedWritingContainer />
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
        accept=".png, .jpeg, .jpg"
        multiple
      />
      <div>
        <div className="w-full p-6 h-[250px] max-sm:h-[230px] shadow-md bg-white border border-[#9E69E3] border-dashed rounded-3xl">
          {!attachedFile && !uploadLoading && !pdfProcessing && (
            <div className="flex flex-col items-center justify-between gap-4 h-full">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <PowerPointIcon />
                  <MsWordIcon />
                  <PDFIconAlt />
                  <JPGIcon />
                </div>
                <p className="text-xl font-semibold">
                  Upload your material here
                </p>
                <p className="text-[#00000080] text-xs mt-1">
                  Max size: {maxFileSizeMB}mb pdf, docx, pptx, ppt, png, jpg,
                  txt
                </p>
              </div>

              <div className="relative" ref={uploadButtonContainerRef}>
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
                <button
                  onClick={() => {
                    if (disableUpload) {
                      toast.error("Please wait until your test is ready");
                      return;
                    }
                    setIsChooseFileTypePopUp(!isChooseFileTypePopUp);
                  }}
                  type="button"
                  className="border border-[#9333EA] px-6 py-2 text-[#2F004F] rounded-full font-medium text-sm"
                >
                  Browse files
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col items-center justify-center gap-4 h-full">
            {attachedFile && uploadLoading && <FileUploadSpinner />}
            {pdfProcessing && (
              <FileUploadSpinner
                title={`Processing File ${ocrProgress && ocrProgress}`}
              />
            )}

            {attachedFile && !uploadLoading && !pdfProcessing && (
              <TransitionUp>
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
                />
              </TransitionUp>
            )}
          </div>
        </div>
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
