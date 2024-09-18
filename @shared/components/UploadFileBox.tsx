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

import { pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

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

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { setModalContent } = useModalContext();

  const createFileFromText = (text: string, fileName: string) => {
    // Create a new File object using the text
    const file = new File([text], fileName, {
      type: "text/plain",
    });

    return file;
  };

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
                  const text = await extractText(file, Number(start), Number(end));
                  if (!text.trim()) {
                    setPdfProcessing(false);
                    toast.error(
                      "Scanned PDFs or PDFs with only images are not allowed"
                    );
                    return;
                  }
                  const newTxtFile = createFileFromText(
                    text,
                    `${getFileNameWithoutExtension(file.name)}.txt`
                  );
                  setPdfProcessing(false);
                  handleSelectFile(newTxtFile);
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
          const endIndex = endPage ? endPage : numPages
          const startIndex = startPage ? startPage : 1

          console.log(startIndex, endIndex)

          for (let i = startIndex; i <= endIndex; i++) {
            const page = await pdf.getPage(startIndex);
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
              Processing File
            </p>
          </div>
        )}
      </div>
    </>
  ) : (
    <></>
  );
};

export default UploadFileBox;
