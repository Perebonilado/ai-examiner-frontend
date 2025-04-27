import React, { FC } from "react";
import Modal from "../Modal";
import Button from "@/@shared/ui/Button";
import PictureIcon from "@/icons/PictureIcon";
import NoteIcon from "@/icons/NoteIcon";
import PageControls from "./PageControls";
import EditTextContainer from "./EditTextContainer";
import ViewImageContainer from "./ViewImageContainer";

const ProcessedWritingContainer: FC = () => {
  return (
    <Modal>
      <div className="w-full gap-6 p-5 max-w-[500px] max-sm:max-w-[96vw] rounded-lg bg-white h-[90vh] flex flex-col justify-between">
        <p className="text-xl font-bold">Generated text</p>
        <EditTextContainer
          handleNextPage={() => {}}
          handlePreviousPage={() => {}}
          currentPage={1}
          totalCount={5}
        />
        {/* <ViewImageContainer
          currentPage={1}
          totalCount={5}
          imageSrc="/home/ai-generated.png"
          handleExpand={() => {}}
          handleNextPage={() => {}}
          handlePreviousPage={() => {}}
        /> */}
        <div className="flex items-center justify-center gap-4">
          <Button
            title="View Text"
            variant="outlined"
            size="large"
            starticon={<NoteIcon />}
          />
          {/* <Button
            title="View Image"
            variant="outlined"
            size="large"
            starticon={<PictureIcon />}
          /> */}
          <Button title="Upload" size="large" />
        </div>
      </div>
    </Modal>
  );
};

export default ProcessedWritingContainer;
