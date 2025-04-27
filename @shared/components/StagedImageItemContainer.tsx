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
    <div className="w-full flex flex-col relative max-h-[80vh] min-h-[400px] max-w-[410px] max-md:max-w-[320px] rounded-xl shadow-lg p-4 py-5 bg-white">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-4 w-full">
        {currentFileSize > allowedFileSize && (
          <p className="text-sm text-rose-500 italic text-center">
            File size ({currentFileSize}mb) exceeds {allowedFileSize}mb
          </p>
        )}
        <h3 className="max-sm:text-center mb-1 font-semibold">Choose Images</h3>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <BlobProvider document={myDoc}>
          {({ blob }) => (
            <>
              {/* Images Scroll Area */}
              <div className="flex-1 overflow-y-auto pr-2">
                <div className="flex flex-col items-center gap-4">
                  {isConvertingHeic ? (
                    <FileUploadSpinner title={`Optimizing images`} />
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
              <div className="pt-6">
                <div
                  className="flex items-center gap-2 mb-4 cursor-pointer"
                  onClick={() => setIsHandWritten(!isHandWritten)}
                >
                  <Checkbox checked={isHandWritten} />
                  <p className="text-sm">
                    Please <span className="font-bold">SELECT</span> if the file
                    is handwritten
                  </p>
                </div>

                <div className="flex items-center justify-end gap-4 w-full">
                  <Button
                    title="Continue"
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
                  <Button
                    title="Cancel"
                    variant="outlined"
                    onClick={handleCancel}
                  />
                </div>
              </div>
            </>
          )}
        </BlobProvider>
      </div>
    </div>
  );
};

export default StagedImageItemContainer;
