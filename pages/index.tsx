import GenerateMCQFormContainer from "@/@modules/home/GenerateMCQFormContainer";
import MCQContainer from "@/@modules/home/MCQContainer";
import AppHead from "@/@shared/components/AppHead";
import { mockQuestions } from "@/constants";
import { useState } from "react";

export default function Home() {
  const [isFormView, setIsFormView] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState("");

  const handleFile = (file: File | null) => {
    setFile(file);
  };

  return (
    <>
      <AppHead />
      <div>
        {isFormView ? (
          <GenerateMCQFormContainer
            file={file}
            handleFile={handleFile}
            allowedTypes={["doc", "docx", "pdf", "ppt", "pptx", "txt"]}
            maxFileSizeMB={10}
          />
        ) : (
          <MCQContainer
            data={mockQuestions.map((d) => ({
              answerId: d.correctAnswerId,
              ...d,
            }))}
          />
        )}
      </div>
    </>
  );
}
