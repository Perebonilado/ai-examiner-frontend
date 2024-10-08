import React, { FC } from "react";
import { useFormik, FormikProvider, Form } from "formik";
import { ViewState } from "./MoreActions";
import Button from "@/@shared/ui/Button";
import TextField from "@/@shared/ui/Input/TextField";
import { EditDocumentTitleValidation } from "@/validation-schemas/EditDocumentTitleValidation";
import CloseIcon from "@/icons/CloseIcon";
import { useModalContext } from "@/contexts/ModalContext";

interface Props {
  handleSubmit: (title: string) => void;
  documentTitle: string;
  handleView: (view: ViewState) => void;
}

const EditDocumentForm: FC<Props> = ({
  documentTitle,
  handleSubmit,
  handleView,
}) => {
  const initialValues = {
    title: documentTitle,
  };

  const formik = useFormik({
    initialValues,
    validationSchema: EditDocumentTitleValidation,
    onSubmit: (values) => {
      handleSubmit(values.title);
    },
  });

  const { setModalContent } = useModalContext();

  return (
    <div className="w-full relative overflow-hidden max-w-[400px] max-md:max-w-[350px] rounded-xl shadow-lg flex flex-col justify-center bg-white">
      <div className="flex items-center justify-between p-4 bg-gray-100">
        <p className="font-medium text-left">Edit Title</p>
        <button
          className="cursor-pointer"
          onClick={() => {
            setModalContent(null);
          }}
        >
          <CloseIcon />
        </button>
      </div>

      <div className="my-3 p-4">
        <FormikProvider value={formik}>
          <Form>
            <TextField
              {...formik.getFieldProps("title")}
              error={formik.touched.title ? formik.errors.title : undefined}
            />
            <div className="mt-4 flex justify-end gap-4">
              <Button
                title="Cancel"
                variant="outlined"
                size="medium"
                onClick={() => {
                  formik.setFieldValue("title", documentTitle);
                  handleView("default");
                }}
                type="button"
              />
              <Button
                title="Submit"
                type="submit"
                variant="contained"
                size="medium"
              />
            </div>
          </Form>
        </FormikProvider>
      </div>
    </div>
  );
};

export default EditDocumentForm;
