import React, { FC, useState } from "react";
import StagedImageItem, { StagedImage } from "./StagedImageItem";
import {
  BlobProvider,
  Document,
  Page,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import Button from "../ui/Button";
import Checkbox from "../ui/Input/Checkbox/Checkbox";

interface Props {
  data: StagedImage[];
  handleDelete: (id: number) => void;
  handleUploadFiles: (blob: Blob, isForTextExtraction?: boolean) => void;
  handleCancel: () => void;
  allowedFileSize: number;
  currentFileSize: number;
}

const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
});

const StagedImageItemContainer: FC<Props> = ({
  data,
  handleDelete,
  allowedFileSize,
  currentFileSize,
  handleCancel,
  handleUploadFiles,
}) => {
  const [isHandWritten, setIsHandWritten] = useState(false);

  const myDoc = (
    <Document>
      {data.map((d, index) => (
        <Page key={index} size="A4" style={styles.page}>
          <Image src={URL.createObjectURL(d.file)} style={styles.image} />
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
        <h3 className="max-sm:text-center mb-1">Choose Images</h3>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <BlobProvider document={myDoc}>
          {({ blob }) => (
            <>
              {/* Images Scroll Area */}
              <div className="flex-1 overflow-y-auto pr-2">
                <div className="flex flex-col items-center gap-4">
                  {data.map((img, idx) => (
                    <StagedImageItem
                      key={idx}
                      data={img}
                      handleDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>

              {/* Bottom Actions (Checkbox + Buttons) */}
              <div className="pt-6">
                <div
                  className="flex items-center gap-2 mb-4 cursor-pointer"
                  onClick={() => setIsHandWritten(!isHandWritten)}
                >
                  <Checkbox checked={isHandWritten} />
                  <p className="text-sm">
                    Please <span className="font-bold">SELECT</span> if the file is hand written
                  </p>
                </div>

                <div className="flex items-center justify-end gap-4 w-full">
                  <Button
                    title="Continue"
                    onClick={() => {
                      if (blob) {
                        handleUploadFiles(blob, isHandWritten);
                      }
                    }}
                    disabled={currentFileSize > allowedFileSize}
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
