import React, { FC } from "react";
import { Form, useFormik, FormikProvider } from "formik";
import TextField from "@/@shared/ui/Input/TextField";
import UploadFileBox from "@/@shared/components/UploadFileBox";
import Button from "@/@shared/ui/Button";

const initialValues = {
  title: "",
};

const GenerateQuestionsForm: FC = () => {
  const formik = useFormik({
    initialValues,
    onSubmit: (values) => handleSubmit(values),
  });

  const handleSubmit = (values: typeof initialValues) => {};
  return (
    <section>
      <FormikProvider value={formik}>
        <Form>
          <div className="flex flex-col gap-4 mx-auto w-full max-w-[500px]">
            <TextField
              label="Document Title"
              placeholder="Enter the title of the document you want to upload"
            />

            <UploadFileBox />

            <Button title="Generate Questions" size="large"/>
          </div>
        </Form>
      </FormikProvider>
    </section>
  );
};

export default GenerateQuestionsForm;
