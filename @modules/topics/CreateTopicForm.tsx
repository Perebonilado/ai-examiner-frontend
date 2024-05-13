import React, { FC, useState } from "react";
import { useFormik, Form, FormikProvider } from "formik";
import TextField from "@/@shared/ui/Input/TextField";
import Button from "@/@shared/ui/Button";
import { useModalContext } from "@/contexts/ModalContext";
import { toast } from "react-toastify";
import { AppLoader } from "@/@shared/components/AppLoader";
import FileUpload from "@/@shared/components/FileUpload/FileUpload";
import { AddTopicValidation } from "@/validation-schemas/AddTopicValidation";

const initialValues = {
  title: "",
};

const CreateTopicForm: FC = () => {
  const handleSubmit = (values: typeof initialValues) => {};

  const { setModalContent } = useModalContext();

  const formik = useFormik({
    initialValues,
    validationSchema: AddTopicValidation,
    onSubmit: handleSubmit,
  });

  const [file, setFile] = useState<File | null>(null);

  const handleFile = (file: File | null) => {
    setFile(file);
  };

  const allowedTypes = ["doc", "docx", "pdf", "ppt", "pptx", "txt"];

  return (
    <>
      <div className="w-full max-w-[600px] max-sm:max-w-[90vw] rounded-xl bg-white p-4 shadow-lg">
        <h2 className="text-lg font-semibold text-center mb-6">Add Topic</h2>

        <FormikProvider value={formik}>
          <Form>
            <div className="flex flex-col gap-5">
              <TextField
                label="Topic Title"
                {...formik.getFieldProps("title")}
                placeholder="Enter topic title"
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

export default CreateTopicForm;
