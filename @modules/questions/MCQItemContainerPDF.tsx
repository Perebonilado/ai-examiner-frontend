import { QuestionsModel } from "@/models/questions.model";
import React, { ElementRef, FC, useRef } from "react";
import dynamic from "next/dynamic";
import Button from "@/@shared/ui/Button";
import MCQItemsPDF from "./MCQItemsPDF";
import PDFIcon from "@/icons/PDFIcon";
import MCQAnswersPDF from "./MCQAnswersPDF";
import ShareQuestionDialog from "./ShareQuestionDialog";
import { useModalContext } from "@/contexts/ModalContext";
import { Download, Share2 } from "lucide-react";

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
  /** Called after Share / Download Q&A is chosen (closes the test header menu). */
  onAction?: () => void;
}

const menuItemClassName =
  "flex items-center gap-2.5 w-full h-9 px-2.5 rounded-[7px] text-sm font-medium text-body text-left hover:bg-hover hover:text-ink transition-colors [&>svg]:text-muted hover:[&>svg]:text-ink";

const MCQItemContainerPDF: FC<Props> = ({ data, title, handleCopyShareLink, onAction }) => {
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
      <div className="flex flex-col">
        <button
          type="button"
          role="menuitem"
          className={menuItemClassName}
          onClick={() => {
            setModalContent(
              <ShareQuestionDialog handleCopy={handleCopyShareLink} />
            );
            onAction && onAction();
          }}
        >
          <Share2 size={16} strokeWidth={1.75} />
          Share
        </button>
        <button
          type="button"
          role="menuitem"
          className={menuItemClassName}
          onClick={() => {
            handleDownloadQandA();
            // let the hidden download links finish their click before the menu unmounts
            if (onAction) setTimeout(onAction, 0);
          }}
        >
          <Download size={16} strokeWidth={1.75} />
          Download Q&amp;A
        </button>

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
