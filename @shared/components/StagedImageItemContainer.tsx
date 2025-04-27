import React, { FC, useEffect, useState } from "react";
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
  handleUploadFiles: (blob: Blob) => void;
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
    objectFit: "contain", // Ensures the image covers the entire page
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
  const myDoc = (
    <Document>
      {data.map((d, index) => (
        <Page key={index} size="A4" style={styles.page}>
          <Image src={URL.createObjectURL(d.file)} style={styles.image} />
        </Page>
      ))}
    </Document>
  );

  const [blob_, setBlob] = useState<Blob | null>(null);

  return (
    <div className="w-full flex flex-col relative max-h-[80vh] min-h-[400px] max-w-[410px] max-md:max-w-[320px] rounded-xl shadow-lg p-4 py-5 bg-white">
      <div className="flex flex-col gap-2 mb-4 w-full">
        {currentFileSize > allowedFileSize && (
          <p className="text-sm text-rose-500 italic text-center">
            File size ({currentFileSize}mb) exceeds {allowedFileSize}mb
          </p>
        )}
        <h3 className="max-sm:text-center mb-1">Choose Images</h3>
      </div>
      <div style={{ flex: 1 }} className="overflow-y-auto">
        <BlobProvider document={myDoc}>
          {({ blob, url, loading, error }) => {
            if (!blob_) setBlob(blob);
            console.log(blob);
            return (
              <div
                className="flex flex-col items-center justify-center gap-4 overflow-y-auto"
                style={{ flex: 1 }}
              >
                {data.map((img, idx) => {
                  return (
                    <StagedImageItem
                      data={img}
                      handleDelete={handleDelete}
                      key={idx}
                    />
                  );
                })}
              </div>
            );
          }}
        </BlobProvider>
      </div>
      <div className="mt-10">
        <div className="flex items-center gap-2 mb-4">
          <Checkbox />
          <p className="text-sm">
            Please <span className="font-bold">SELECT</span> if the file is hand
            written
          </p>
        </div>
        <div className="flex items-center justify-end gap-4 w-full ">
          <Button
            title="Continue"
            onClick={() => {
              if (blob_) {
                handleUploadFiles(blob_);
              }
            }}
            disabled={currentFileSize > allowedFileSize}
          />
          <Button
            title="Cancel"
            variant="outlined"
            onClick={() => {
              handleCancel();
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default StagedImageItemContainer;
