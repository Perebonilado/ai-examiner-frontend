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

  return (
    <>
      <BlobProvider document={myDoc}>
        {({ blob, url, loading, error }) => {
          return (
            <>
              <div className="flex items-center justify-center gap-4 flex-wrap">
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
              <div className="flex items-center justify-end gap-4 w-full h-[20%] mt-10">
                <Button
                  title="Upload"
                  onClick={() => {
                    if (blob) {
                      handleUploadFiles(blob);
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
            </>
          );
        }}
      </BlobProvider>
    </>
  );
};

export default StagedImageItemContainer;
