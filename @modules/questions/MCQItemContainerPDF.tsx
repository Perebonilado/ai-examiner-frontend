import { QuestionsModel } from "@/models/questions.model";
import React, { FC } from "react";
import dynamic from "next/dynamic";
import Button from "@/@shared/ui/Button";
import MCQItemsPDF from "./MCQItemsPDF";
import PDFIcon from "@/icons/PDFIcon";
import MCQAnswersPDF from "./MCQAnswersPDF";

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
}

const MCQItemContainerPDF: FC<Props> = ({ data, title }) => {
  return (
    <div>
      <div className="flex flex-col justify-center items-center gap-5">
        <PDFDownloadLink
          document={<MCQItemsPDF questions={data} title={title} />}
          fileName={title + " Questions"}
        >
          <a>
            <Button
              title="Download Questions"
              starticon={<PDFIcon />}
              variant="outlined"
            />
          </a>
        </PDFDownloadLink>
        <PDFDownloadLink
          document={<MCQAnswersPDF questions={data} title={title} />}
          fileName={title + " Answers"}
        >
          <a>
            <Button
              title="Download Answers"
              starticon={<PDFIcon />}
              variant="outlined"
            />
          </a>
        </PDFDownloadLink>
      </div>
      <div className="absolute scale-0 -z-50">
        <MCQItemsPDF questions={data} title={title} />
      </div>
    </div>
  );
};

export default MCQItemContainerPDF;
