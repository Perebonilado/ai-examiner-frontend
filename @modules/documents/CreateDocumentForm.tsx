import React, { FC, useEffect, useState } from "react";
import { useFormik, Form, FormikProvider } from "formik";
import TextField from "@/@shared/ui/Input/TextField";
import Button from "@/@shared/ui/Button";
import { useModalContext } from "@/contexts/ModalContext";
import { toast } from "react-toastify";
import { AppLoader } from "@/@shared/components/AppLoader";
import FileUpload from "@/@shared/components/FileUpload/FileUpload";
import { AddDocumentValidation } from "@/validation-schemas/AddDocumentValidation";
import { useAddDocumentMutation } from "@/api-services/document.service";
import { useParams } from "next/navigation";

const initialValues = {
  title: "",
};

const CreateDocumentForm: FC = () => {
  const [courseId, setCourseId] = useState("");

  const params = useParams();

  useEffect(() => {
    if (params) {
      setCourseId(params.id as string);
    }
  }, [params]);

  const [addDocument, { isLoading, isSuccess, error }] = useAddDocumentMutation();

  const handleSubmit = (values: typeof initialValues) => {
    if (!file) {
      toast.error("Please attach a file");

      return;
    }

    const formData = new FormData();

    formData.append("title", values.title);
    formData.append("courseId", courseId);
    formData.append("document", file);

  };

  const { setModalContent } = useModalContext();

  const formik = useFormik({
    initialValues,
    validationSchema: AddDocumentValidation,
    onSubmit: handleSubmit,
  });

  const [file, setFile] = useState<File | null>(null);

  const handleFile = (file: File | null) => {
    setFile(file);
  };

  const allowedTypes = ["doc", "docx", "pdf", "ppt", "pptx", "txt"];

  useEffect(() => {
    if (isSuccess) {
      toast.success("Document Successfully Created");
      formik.resetForm();
      setModalContent(null);
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
    <>
      {isLoading && (
        <AppLoader loaderMessage="Just a moment while we add your document" />
      )}
      <div className="w-full max-w-[600px] max-sm:max-w-[90vw] rounded-xl bg-white p-4 shadow-lg">
        <h2 className="text-lg font-semibold text-center mb-6">Add Document</h2>

        <FormikProvider value={formik}>
          <Form>
            <div className="flex flex-col gap-5">
              <TextField
                label="Document Title"
                {...formik.getFieldProps("title")}
                placeholder="Enter document title"
                error={formik.touched.title ? formik.errors.title : undefined}
              />

              <div>
                <label className={`text-base font-semibold mb-2 block`}>
                  Attach File
                </label>
                <FileUpload
                  handleChange={handleFile}
                  allowedTypes={allowedTypes}
                  maxFileSizeMB={5}
                  file={file}
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <Button
                  title="Cancel"
                  variant="outlined"
                  type="button"
                  onClick={() => {
                    setModalContent(null);
                  }}
                />
                <Button title="Submit" type="submit" />
              </div>
            </div>
          </Form>
        </FormikProvider>
      </div>
    </>
  );
};

export default CreateDocumentForm;
