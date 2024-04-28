import GenerateMCQFormContainer from "@/@modules/home/GenerateMCQFormContainer";
import MCQContainer from "@/@modules/home/MCQContainer";
import AppHead from "@/@shared/components/AppHead";
import { AppLoader } from "@/@shared/components/AppLoader";
import { useGenerateMCQsMutation } from "@/api-services/questions.service";
import { mockQuestions } from "@/constants";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function Home() {
  const [isFormView, setIsFormView] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [
    generateQuestions,
    { data: questions, isLoading, isSuccess, isError },
  ] = useGenerateMCQsMutation();

  const handleFile = (file: File | null) => {
    setFile(file);
  };

  const handleSubmitQuestionGenerationForm = (
    values: Record<string, string>
  ) => {
    const formData = new FormData();
    for (const key in values) {
      formData.append(key, values[key]);
    }

    if (file) {
      formData.append("document", file);
    }

    generateQuestions(formData);
  };

  useEffect(() => {
    if (isError) {
      toast.error("Something went wrong, let's try that again");
    }
  }, [isError]);

  useEffect(() => {
    if (isSuccess) {
      setFile(null);
      setIsFormView(false);
    }
  }, [isSuccess]);

  return (
    <>
      {isLoading && (
        <AppLoader loaderMessage="Just a minute, we are generating your questions ..." />
      )}
      <AppHead />
      <div>
        {isFormView ? (
          <GenerateMCQFormContainer
            file={file}
            handleFile={handleFile}
            allowedTypes={["doc", "docx", "pdf", "ppt", "pptx", "txt"]}
            maxFileSizeMB={10}
            handleFormValues={(values: Record<string, string>) => {
              handleSubmitQuestionGenerationForm(values);
            }}
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
