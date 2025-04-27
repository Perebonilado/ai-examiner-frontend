import React, { FC, useState } from "react";
import Modal from "../Modal";
import Button from "@/@shared/ui/Button";
import PictureIcon from "@/icons/PictureIcon";
import NoteIcon from "@/icons/NoteIcon";
import PageControls from "./PageControls";
import EditTextContainer from "./EditTextContainer";
import ViewImageContainer from "./ViewImageContainer";
import CloseIcon from "@/icons/CloseIcon";

const ProcessedWritingContainer: FC = () => {
  const [isViewingText, setIsViewingText] = useState(true);
  return (
    <Modal>
      <div className="w-full gap-6 p-5 max-w-[500px] max-sm:max-w-[96vw] rounded-lg bg-white h-[90vh] flex flex-col justify-between">
        <p className="text-xl font-bold flex items-center justify-between">
          {isViewingText ? "Generated Text" : "Your uploaded image"}
          <button type="button">
            <CloseIcon />
          </button>
        </p>
        {isViewingText && (
          <EditTextContainer
            handleNextPage={() => {}}
            handlePreviousPage={() => {}}
            currentPage={1}
            totalCount={5}
          />
        )}
        {!isViewingText && (
          <ViewImageContainer
            currentPage={1}
            totalCount={5}
            imageSrc="/home/ai-generated.png"
            handleExpand={() => {}}
            handleNextPage={() => {}}
            handlePreviousPage={() => {}}
          />
        )}
        <div className="flex items-center justify-center gap-4">
          {!isViewingText && (
            <Button
              title="View Text"
              variant="outlined"
              size="large"
              starticon={<NoteIcon />}
              onClick={() => {
                setIsViewingText(true);
              }}
              type="button"
            />
          )}
          {isViewingText && (
            <Button
              title="View Image"
              variant="outlined"
              size="large"
              starticon={<PictureIcon />}
              onClick={() => {
                setIsViewingText(false);
              }}
              type="button"
            />
          )}
          <Button title="Upload" size="large" type="button" />
        </div>
      </div>
    </Modal>
  );
};

export default ProcessedWritingContainer;
