import React, { FC, useState } from "react";
import Modal from "../Modal";
import Button from "@/@shared/ui/Button";
import PictureIcon from "@/icons/PictureIcon";
import NoteIcon from "@/icons/NoteIcon";
import EditTextContainer from "./EditTextContainer";
import ViewImageContainer from "./ViewImageContainer";
import CloseIcon from "@/icons/CloseIcon";
import { useModalContext } from "@/contexts/ModalContext";
import EnlargedImage from "../EnlargedImage";

interface Props {
  textContent: string[];
  images: string[];
  handleClose: () => void;
  handleUpload: (updatedText: string[]) => void;
}

const ProcessedWritingContainer: FC<Props> = ({
  images,
  textContent,
  handleClose,
  handleUpload,
}) => {
  const [isViewingText, setIsViewingText] = useState(true);
  const [currIndex, setCurrIndex] = useState(0);
  const [content, setContent] = useState(textContent);

  const handleNext = () => {
    if (currIndex < textContent.length - 1) {
      const newIndx = currIndex + 1;
      setCurrIndex(newIndx);
    }
  };

  const handlePrevious = () => {
    if (currIndex !== 0) {
      const newIndx = currIndex - 1;
      setCurrIndex(newIndx);
    }
  };

  const { setModalContent } = useModalContext();

  const [enlargedImageUrl, setEnlargedImageUrl] = useState<string | null>(null);

  return enlargedImageUrl ? (
    <Modal>
      <EnlargedImage
        imageUrl={enlargedImageUrl}
        close={() => {
          setEnlargedImageUrl(null);
        }}
      />
    </Modal>
  ) : (
    <Modal>
      <div className="w-full gap-6 p-5 max-w-[500px] max-sm:max-w-[96vw] rounded-lg bg-white h-[85vh] flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xl font-bold ">
              {isViewingText ? "Generated Text" : "Your uploaded image"}
            </p>
            <p className="text-xs w-full max-w-[350px] mt-1 text-gray-600">Give your text a quick proofread to catch any mistakes we might have missed!</p>
          </div>

          <button type="button" onClick={handleClose}>
            <CloseIcon />
          </button>
        </div>

        {isViewingText && (
          <EditTextContainer
            handleNextPage={handleNext}
            handlePreviousPage={handlePrevious}
            currentPage={currIndex + 1}
            totalCount={content.length}
            text={content[currIndex]}
            index={currIndex}
            handleChange={(text, index) => {
              const newContent = content.map((c, idx) => {
                if (idx === index) {
                  return text;
                }

                return c;
              });
              setContent(newContent);
            }}
          />
        )}
        {!isViewingText && (
          <ViewImageContainer
            imageSrc={images[currIndex]}
            handleExpand={(url) => {
              setEnlargedImageUrl(url);
            }}
            handleNextPage={handleNext}
            handlePreviousPage={handlePrevious}
            currentPage={currIndex + 1}
            totalCount={content.length}
          />
        )}
        <div className="flex items-center justify-center gap-4">
          {!isViewingText && (
            <Button
              title="View Text"
              variant="outlined"
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
              starticon={<PictureIcon />}
              onClick={() => {
                setEnlargedImageUrl(images[currIndex]);
              }}
              type="button"
            />
          )}
          <Button
            title="Upload"
            type="button"
            onClick={() => {
              handleUpload(content);
            }}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ProcessedWritingContainer;
