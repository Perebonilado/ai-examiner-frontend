import Spinner from "@/@shared/components/Spinner";
import Button from "@/@shared/ui/Button";
import ProgressBar from "@ramonak/react-progress-bar";
import DOMPurify from "dompurify";
import { marked } from "marked";
import React, { FC, useEffect, useState } from "react";
import { motion } from "framer-motion";
import ChevronLeft from "@/icons/ChevronLeft";

interface Props {
  summary: string;
  progress: number;
  handleStartTest: () => void;
  handleBack: () => void;
}

const ViewDocumentSummary: FC<Props> = ({
  summary,
  progress,
  handleStartTest,
  handleBack
}) => {
  const [htmlSummary, setHtmlSummary] = useState("");

  useEffect(() => {
    if (summary) {
      handleHtmlMessage();
    }
  }, [summary]);

  const handleHtmlMessage = async () => {
    const formatted = summary;
    const parsed = await marked(DOMPurify.sanitize(formatted), {});
    setHtmlSummary(parsed);
  };
  return (
    <motion.div
      initial={{ maxHeight: "10vh" }}
      whileInView={{ maxHeight: "95vh", transition: { duration: 0.5 } }}
      viewport={{ once: true }}
      className="w-full md:max-w-[900px] max-w-[95vw] bg-white h-full max-h-[95vh] rounded-xl flex flex-col"
    >
      <div className="flex items-center gap-2 px-4">
        <button className="!p-0 !m-0" onClick={handleBack}>
          <ChevronLeft />
        </button>
        <p className="py-4 text-xl font-semibold">Summary</p>
      </div>
      <div style={{ flex: 1 }} className="bg-slate-100 p-8 overflow-auto">
        <div
          dangerouslySetInnerHTML={{ __html: htmlSummary }}
          className="prose prose-sm max-w-full text-gray-800 overflow-x-hidden"
        ></div>
      </div>
      <div className="flex justify-end items-center gap-4 px-4 py-4">
        <div style={{ flex: 1 }}>
          <ProgressBar completed={progress} height="6px" customLabel=" " />
        </div>
        <Button
          title="Start Test"
          size="large"
          disabled={progress < 100}
          onClick={handleStartTest}
        />
      </div>
    </motion.div>
  );
};

export default ViewDocumentSummary;
