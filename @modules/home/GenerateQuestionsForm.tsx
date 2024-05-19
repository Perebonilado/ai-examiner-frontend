import React, { FC, useState } from "react";
import { Form, useFormik, FormikProvider } from "formik";
import TextField from "@/@shared/ui/Input/TextField";
import UploadFileBox from "@/@shared/components/UploadFileBox";
import Button from "@/@shared/ui/Button";
import { useAddDocumentMutation } from "@/api-services/document.service";
import { toast } from "react-toastify";
import DropDown from "@/@shared/ui/Input/DropDown";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { AppLoader } from "@/@shared/components/AppLoader";
import { useModalContext } from "@/contexts/ModalContext";

const initialValues = {
  title: "",
};

const GenerateQuestionsForm: FC = () => {
  const formik = useFormik({
    initialValues,
    onSubmit: (values) => handleSubmit(values),
  });

  const router = useRouter();

  const { setModalContent } = useModalContext();

  const [createDocAndGenerateQuestions, { data, isLoading, error, isSuccess }] =
    useAddDocumentMutation();

  const allowedMimeTypes = ["docx", "doc", "pdf", "pptx"];

  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (values: typeof initialValues) => {
    if (!file) {
      toast.error("Please attach a file");
      return;
    }
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("document", file);

    createDocAndGenerateQuestions(formData);
  };

  useEffect(() => {
    if (data) {
      router.push(`/questions/practise-questions/${data.questionId}`);
    }
  }, [data]);

  useEffect(() => {
    if (isLoading) {
      setModalContent(<AppLoader />);
    } else {
      setModalContent(null);
    }
  }, [isLoading]);

  useEffect(() => {
    if (isSuccess) {
      toast.success("Questions Successfully generated for document");
    }
  }, [isSuccess]);

  useEffect(() => {
    if (error && "status" in error) {
      if ("data" in error) {
        const { message } = error.data as { message: string };
        toast.error(message);
      } else toast.error("Oops! Something went wrong");
    }
  }, [error]);

  return (
    <section>
      <FormikProvider value={formik}>
        <Form>
          <div className="flex flex-col gap-4 mx-auto w-full max-w-[500px] pt-2 pb-10">
            <TextField
              label="Document Title"
              placeholder="Enter the title of the document you want to upload"
              {...formik.getFieldProps("title")}
              error={formik.touched.title ? formik.errors.title : undefined}
            />

            <UploadFileBox
              allowedTypes={allowedMimeTypes}
              attachedFile={file}
              handleSelectFile={(file) => {
                setFile(file);
              }}
              handleDeleteFile={() => {
                setFile(null);
              }}
            />

            <DropDown
              options={[
                { label: "5", value: "5", defaultSelected: true },
                { label: "10", value: "10" },
                { label: "15", value: "15" },
                { label: "20", value: "20" },
                { label: "25", value: "25" },
              ]}
              label="Number of Questions"
            />

            <Button title="Generate Questions" size="large" />
          </div>
        </Form>
      </FormikProvider>
    </section>
  );
};

export default GenerateQuestionsForm;
