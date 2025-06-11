import Dialog from "@/@shared/components/Dialog";
import Button from "@/@shared/ui/Button";
import IconButton from "@/@shared/ui/IconButton";
import { useModalContext } from "@/contexts/ModalContext";
import ChevronLeft from "@/icons/ChevronLeft";
import DotsIcon from "@/icons/DotsIcon";
import { capitalizeFirstLetterOfEachWord } from "@/utils";
import React, { FC } from "react";
import MCQItemContainerPDF from "./MCQItemContainerPDF";
import { QuestionsModel } from "@/models/questions.model";
import cn from "classnames";

interface Props {
  handleBack: () => void;
  title: string;
  questions?: QuestionsModel[];
  handleCopyShareLink?: () => void;
}

const TestPageTitle: FC<Props> = ({
  handleBack,
  title,
  questions,
  handleCopyShareLink,
}) => {
  const { setModalContent } = useModalContext();
  return (
    <div className="flex items-center justify-between relative pb-18 pb-7">
      <div className="">
        <div className="hidden max-md:block">
          <Button
            title="Back"
            variant="text"
            starticon={<ChevronLeft />}
            className="!gap-1"
            size="small"
            onClick={() => {
              handleBack();
            }}
          />
        </div>
      </div>
      <div className="">
        <h1 className="text-center text-xl font-semibold flex-1 max-w-[150px] truncate text-ellipsis">
          {capitalizeFirstLetterOfEachWord(title)} Questions
        </h1>
      </div>

      {
        <div className="flex items-center justify-between">
          <div
            className={cn({
              ["hidden"]: !questions,
              ["block"]: questions,
            })}
          >
            <IconButton
              icon={<DotsIcon />}
              size="small"
              title=""
              onClick={() => {
                setModalContent(
                  <Dialog>
                    <MCQItemContainerPDF
                      data={questions || []}
                      title={capitalizeFirstLetterOfEachWord(title)}
                      handleCopyShareLink={() => {
                        handleCopyShareLink && handleCopyShareLink();
                      }}
                    />
                  </Dialog>
                );
              }}
            />
          </div>
        </div>
      }
    </div>
  );
};

export default TestPageTitle;
