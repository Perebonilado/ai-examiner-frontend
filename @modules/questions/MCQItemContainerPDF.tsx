import { QuestionsModel } from "@/models/questions.model";
import React, { ElementRef, FC, useRef } from "react";
import dynamic from "next/dynamic";
import Button from "@/@shared/ui/Button";
import MCQItemsPDF from "./MCQItemsPDF";
import PDFIcon from "@/icons/PDFIcon";
import MCQAnswersPDF from "./MCQAnswersPDF";
import ShareIcon from "@/icons/ShareIcon";
import ShareQuestionDialog from "./ShareQuestionDialog";
import { useModalContext } from "@/contexts/ModalContext";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  {
    ssr: false,
    loading: () => <></>,
  }
);

interface Props {
  data: QuestionsModel[];
  title: string;
  handleCopyShareLink: ()=>void;
}

const MCQItemContainerPDF: FC<Props> = ({ data, title, handleCopyShareLink }) => {
  const downloadQuestionsRef = useRef<ElementRef<"button">>(null);
  const downloadAnswersRef = useRef<ElementRef<"button">>(null);

  const { setModalContent } = useModalContext();

  const handleDownloadQandA = () => {
    if (downloadAnswersRef.current && downloadQuestionsRef.current) {
      downloadQuestionsRef.current.click();
      downloadAnswersRef.current.click();
    }
  };

  return (
    <div>
      <div className="flex flex-col justify-center items-center gap-5">
        <Button
          title="Share"
          variant="contained"
          endicon={<ShareIcon fill="#FFFFFF" />}
          fullWidth
          onClick={() => {
            setModalContent(
              <ShareQuestionDialog handleCopy={handleCopyShareLink} />
            );
          }}
        />
        <Button
          title="Download Q&A"
          variant="outlined"
          endicon={<PDFIcon />}
          onClick={handleDownloadQandA}
        />

        <span className="scale-[-1] hidden">
          <PDFDownloadLink
            document={<MCQItemsPDF questions={data} title={title} />}
            fileName={title + " Questions"}
          >
            <a>
              <Button
                title="Download Questions"
                starticon={<PDFIcon />}
                variant="outlined"
                ref={downloadQuestionsRef}
              />
            </a>
          </PDFDownloadLink>
        </span>

        <span className="scale-[-1] hidden">
          <PDFDownloadLink
            document={<MCQAnswersPDF questions={data} title={title} />}
            fileName={title + " Answers"}
          >
            <a>
              <Button
                title="Download Answers"
                starticon={<PDFIcon />}
                variant="outlined"
                ref={downloadAnswersRef}
              />
            </a>
          </PDFDownloadLink>
        </span>
      </div>
      <div className="absolute scale-0 -z-50">
        <MCQItemsPDF questions={data} title={title} />
      </div>
    </div>
  );
};

export default MCQItemContainerPDF;
