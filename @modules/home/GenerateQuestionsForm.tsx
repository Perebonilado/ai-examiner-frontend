import React, { FC, useState } from "react";
import { Form, useFormik, FormikProvider } from "formik";
import TextField from "@/@shared/ui/Input/TextField";
import UploadFileBox from "@/@shared/components/UploadFileBox";
import Button from "@/@shared/ui/Button";
import { useAddTopicMutation } from "@/api-services/topic.service";
import { toast } from "react-toastify";

const initialValues = {
  title: "",
};

const GenerateQuestionsForm: FC = () => {
  const formik = useFormik({
    initialValues,
    onSubmit: (values) => handleSubmit(values),
  });

  const [createDocAndGenerateQuestions] = useAddTopicMutation();

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

    createDocAndGenerateQuestions(formData)
  };
  return (
    <section>
      <FormikProvider value={formik}>
        <Form>
          <div className="flex flex-col gap-4 mx-auto w-full max-w-[500px] pt-24">
            <TextField
              label="Document Title"
              placeholder="Enter the title of the document you want to upload"
              {...formik.getFieldProps('title')}
              error={
                formik.touched.title ? formik.errors.title : undefined
              }
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

            <Button title="Generate Questions" size="large" />
          </div>
        </Form>
      </FormikProvider>
    </section>
  );
};

export default GenerateQuestionsForm;
