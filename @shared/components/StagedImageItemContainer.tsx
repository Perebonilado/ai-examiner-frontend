import React, { FC, useEffect, useState } from "react";
import StagedImageItem, { StagedImage } from "./StagedImageItem";
import { BlobProvider, Document, Page, Image } from "@react-pdf/renderer";
import Button from "../ui/Button";
import Checkbox from "../ui/Input/Checkbox/Checkbox";
import * as convert from "heic-convert/browser";
import FileUploadSpinner from "./FileUploadSpinner";

interface Props {
  data: StagedImage[];
  handleDelete: (id: number) => void;
  handleUploadFiles: (
    blob: Blob,
    isForTextExtraction?: boolean,
    images?: string[]
  ) => void;
  handleCancel: () => void;
  allowedFileSize: number;
  currentFileSize: number;
}

const fileToBuffer = (file: File): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      const buffer = Buffer.from(arrayBuffer);
      resolve(buffer);
    };

    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

const StagedImageItemContainer: FC<Props> = ({
  data,
  handleDelete,
  allowedFileSize,
  currentFileSize,
  handleCancel,
  handleUploadFiles,
}) => {
  const [isHandWritten, setIsHandWritten] = useState(false);
  const [convertedData, setConvertedData] = useState<StagedImage[]>([]);
  const [isConvertingHeic, setIsConvertingHeic] = useState(false);

  useEffect(() => {
    const convertHeicImages = async () => {
      const processed = await Promise.all(
        data.map(async (item) => {
          const isHeic =
            item.file.type === "image/heic" ||
            item.file.name.toLowerCase().endsWith(".heic");

          if (!isHeic) return item;

          try {
            setIsConvertingHeic(true);
            const buffer = await fileToBuffer(item.file) as any;
            const image = await convert.all({
              buffer,
              format: "JPEG",
            });
            const outputBlob = await image[0].convert();

            const newFile = new File(
              [outputBlob],
              item.file.name.replace(/\.heic$/i, ".jpg"),
              { type: "image/jpeg" }
            );

            setIsConvertingHeic(false);

            return { ...item, file: newFile };
          } catch (error) {
            setIsConvertingHeic(false);
            console.error("HEIC conversion failed:", error);
            // 🛡️ fallback: use original file if conversion fails
            return item;
          }
        })
      );

      setConvertedData(processed);
    };

    convertHeicImages();
  }, [data]);

  const myDoc = (
    <Document>
      {convertedData.map((d, index) => (
        <Page key={index} size="A4">
          <Image src={URL.createObjectURL(d.file)} />
        </Page>
      ))}
    </Document>
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="staged-images-title"
      className="w-full flex flex-col relative max-h-[86vh] min-h-[400px] max-w-[420px] max-md:max-w-[92vw] rounded-2xl bg-surface overflow-hidden shadow-[0_30px_80px_-30px_rgba(15,10,40,0.5),0_0_0_1px_rgba(16,12,40,0.06)]"
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <h3
          id="staged-images-title"
          className="text-lg font-bold tracking-[-0.015em] text-ink"
        >
          Choose images
        </h3>
        {currentFileSize > allowedFileSize && (
          <p className="mt-1 text-[13px] text-danger" role="alert">
            File size ({currentFileSize}mb) exceeds {allowedFileSize}mb
          </p>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        <BlobProvider document={myDoc}>
          {({ blob }) => (
            <>
              {/* Images Scroll Area */}
              <div className="flex-1 min-h-0 overflow-y-auto px-5 py-2 border-y border-line bg-canvas">
                <div className="flex flex-col items-center gap-3 py-2">
                  {isConvertingHeic ? (
                    <div className="py-10">
                      <FileUploadSpinner title={`Optimizing images`} />
                    </div>
                  ) : (
                    convertedData.map((img, idx) => (
                      <StagedImageItem
                        key={idx}
                        data={img}
                        handleDelete={handleDelete}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="px-5 pt-4">
                <div
                  className="flex items-center gap-2.5 cursor-pointer"
                  onClick={() => setIsHandWritten(!isHandWritten)}
                >
                  <Checkbox checked={isHandWritten} readOnly aria-label="The file is handwritten" />
                  <p className="text-sm text-body">
                    Please select if the file is handwritten
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 mt-4 border-t border-line bg-canvas">
                <Button
                  title="Cancel"
                  variant="outlined"
                  size="medium"
                  onClick={handleCancel}
                  className="max-md:flex-1"
                />
                <Button
                  title="Continue"
                  size="medium"
                  className="min-w-[120px] max-md:flex-1"
                  onClick={() => {
                    if (blob) {
                      const convertedImages = convertedData.map((img) =>
                        URL.createObjectURL(img.file)
                      );
                      handleUploadFiles(blob, isHandWritten, convertedImages);
                    }
                  }}
                  disabled={currentFileSize > allowedFileSize || isConvertingHeic}
                />
              </div>
            </>
          )}
        </BlobProvider>
      </div>
    </div>
  );
};

export default StagedImageItemContainer;
