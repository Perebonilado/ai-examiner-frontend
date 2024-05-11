import GenerateMCQFormContainer from "@/@modules/home/GenerateMCQFormContainer";
import MCQContainer from "@/@modules/home/MCQContainer";
import AppHead from "@/@shared/components/AppHead";
import { AppLoader } from "@/@shared/components/AppLoader";
import Avatar from "@/@shared/components/Avatar";
import EnhancedTable from "@/@shared/components/EnhancedTable/EnhancedTable";
import Button from "@/@shared/ui/Button";
import { useGenerateMCQsMutation } from "@/api-services/questions.service";
import { mockQuestions } from "@/constants";
import AppLayout from "@/layouts/AppLayout";
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
    <AppLayout>
      <div className="flex items-center justify-between w-full pb-10">
        <h2 className="text-2xl font-bold">Courses</h2>
        <Button  title="Create Course"/>
      </div>
      <EnhancedTable
        maxWidth="100%"
        headCellData={[
          { title: "Title", flex: 1 },
          { title: "Description", flex: 2 },
          { title: "Topic Count", flex: 1 },
          { title: "Created At", flex: 1 },
          { title: "Actions", flex: 1 },
        ]}
        generic={true}
        rowData={[]}
      />

      {/* {isLoading && (
        <AppLoader loaderMessage="Just a moment, we are generating your questions ..." />
      )}
      <AppHead />
      <div>
        <h1 className="text-center py-8 pt-0 text-2xl font-bold text-blue-600">AI Examiner</h1>
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
          questions && (
            <MCQContainer
              data={questions}
              handeGenerateNewQuestions={() => setIsFormView(true)}
            />
          )
        )}
        
      </div> */}
    </AppLayout>
  );
}
