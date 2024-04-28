import React, { FC, useState } from "react";
import { useFormik, FormikProvider, Form } from "formik";
import Container from "@/@shared/ui/Container";
import { GenerateMCQValidation } from "@/validation-schemas/GenerateMCQValidation";
import TextField from "@/@shared/ui/Input/TextField";
import Button from "@/@shared/ui/Button";
import FileUpload from "@/@shared/components/FileUpload";
import { toast } from "react-toastify";

const initialValues = {
  category: "",
};

interface Props {
  file: File | null;
  handleFile: (file: File | null) => void;
  allowedTypes: string[];
  maxFileSizeMB?: number;
  handleFormValues: (values: typeof initialValues) => void;
}

const GenerateMCQFormContainer: FC<Props> = ({
  file,
  handleFile,
  allowedTypes,
  maxFileSizeMB,
  handleFormValues,
}) => {
  const formik = useFormik({
    initialValues,
    validationSchema: GenerateMCQValidation,
    onSubmit: (values) => {
      if (!file) {
        toast.error("Please upload a file");
        return;
      } else {
        handleFormValues(values);
      }
    },
  });

  return (
    <section>
      <Container className="py-10">
        <div className="p-5 bg-white mx-auto w-full max-w-[550px] rounded-md">
          <h1 className="text-2xl font-bold text-center">Generate MCQ Form</h1>

          <FormikProvider value={formik}>
            <Form>
              <div className="flex flex-col gap-6 py-10">
                <TextField
                  label="Course"
                  placeholder="Enter your course eg Medicine, Mathematics, Engineering ..."
                  {...formik.getFieldProps("category")}
                  error={
                    formik.touched.category ? formik.errors.category : undefined
                  }
                />
                <FileUpload
                  handleChange={handleFile}
                  allowedTypes={allowedTypes}
                  maxFileSizeMB={maxFileSizeMB}
                  file={file}
                />
                <div className="flex items-center justify-end">
                  <Button title="Generate Questions" type="submit" />
                </div>
              </div>
            </Form>
          </FormikProvider>
        </div>
      </Container>
    </section>
  );
};

export default GenerateMCQFormContainer;
